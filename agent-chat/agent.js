import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5-20250929";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the Nova SBE live networker agent.
Speak only in European Portuguese from Lisbon.
Use tu. Use first person present tense, such as estou a procurar and estou a comparar.
Do not use dashes. Hyphens inside normal compound words are fine.
Do not use these words: delve, showcase, leverage, foster, harness, bolster, streamline, unveil, unravel, elucidate, illuminate, empower, encompass, transcend, catalyze, propel, spearhead, revolutionize, navigate, underscore, comprehensive, multifaceted, intricate, pivotal, nuanced, groundbreaking, transformative, seamless, noteworthy, remarkable, formidable, compelling, invaluable, unprecedented, tapestry, landscape, realm, paradigm, synergy, interplay, intricacies, cornerstone, bedrock, underpinning, linchpin, meticulously, notably, furthermore, moreover, consequently, additionally, crucially, fundamentally, inherently, ultimately.
Narrate before acting. Keep the narration useful and short.
Use the filterProfiles tool before choosing matches.
After the tool result, write a few narration sentences, then finish with exactly this marker and valid JSON:
MATCHES_JSON:
[{"name":"...","role":"...","company":"...","city":"...","reason":"...","intro":"...","confidence":90}]
Return 1 to 3 matches. Use only people from the tool result. The intro must be ready to copy.`;

const filterProfilesTool = {
  name: "filterProfiles",
  description: "Find alumni profiles that match the user's networking request.",
  input_schema: {
    type: "object",
    properties: {
      keywords: {
        type: "array",
        items: { type: "string" },
        description: "Important terms from the user's request, such as fintech, Berlin, hiring or VC.",
      },
      cities: {
        type: "array",
        items: { type: "string" },
        description: "Cities or regions mentioned by the user.",
      },
      industries: {
        type: "array",
        items: { type: "string" },
        description: "Industries mentioned by the user.",
      },
      openTo: {
        type: "array",
        items: { type: "string" },
        description: "Connection types, such as intro, mentorship, hiring, investing, advice or co_founder.",
      },
    },
    required: ["keywords"],
  },
};

function asText(value) {
  if (Array.isArray(value)) return value.join(" ");
  if (value === null || value === undefined) return "";
  return String(value);
}

function profileHaystack(profile) {
  return [
    profile.full_name,
    profile.current_role,
    profile.current_company,
    profile.industry,
    profile.city,
    profile.programme,
    profile.bio,
    asText(profile.expertise),
    asText(profile.looking_for),
    asText(profile.can_offer),
    asText(profile.open_to),
  ]
    .join(" ")
    .toLowerCase();
}

export function filterProfiles(criteria, profiles) {
  const keywords = [
    ...(criteria.keywords ?? []),
    ...(criteria.cities ?? []),
    ...(criteria.industries ?? []),
    ...(criteria.openTo ?? []),
  ]
    .map((keyword) => String(keyword).trim().toLowerCase())
    .filter(Boolean);

  return profiles
    .map((profile) => {
      const haystack = profileHaystack(profile);
      const score = keywords.reduce(
        (total, keyword) => total + (haystack.includes(keyword) ? 2 : 0),
        0,
      );
      return { profile, score };
    })
    .filter((item) => item.score > 0 || keywords.length === 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ profile, score }) => ({
      id: profile.id,
      name: profile.full_name,
      role: profile.current_role,
      company: profile.current_company,
      city: profile.city,
      industry: profile.industry,
      programme: profile.programme,
      graduation_year: profile.graduation_year,
      bio: profile.bio,
      expertise: profile.expertise ?? [],
      looking_for: profile.looking_for ?? [],
      can_offer: profile.can_offer ?? [],
      open_to: profile.open_to ?? [],
      score,
    }));
}

function extractJsonAfterMarker(text) {
  const marker = "MATCHES_JSON:";
  const index = text.indexOf(marker);
  if (index === -1) return null;

  const json = text.slice(index + marker.length).trim();
  if (!json) return null;

  try {
    return JSON.parse(json);
  } catch {
    const match = json.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : null;
  }
}

function toMatchFromProfile(profile, query, position) {
  return {
    id: profile.id ?? `match-${position}`,
    name: profile.full_name ?? profile.name ?? "Alumni Nova SBE",
    role: profile.current_role ?? profile.role ?? "Perfil Nova SBE",
    company: profile.current_company ?? profile.company ?? "Nova SBE alumni network",
    city: profile.city ?? "",
    reason: `Este perfil aparece como uma boa primeira conversa para o pedido: ${query}`,
    intro: `Olá ${profile.full_name ?? profile.name}. Estou a ajudar uma pessoa da rede Nova SBE com este pedido: ${query}. Achei que podias dar uma visão prática ou sugerir a pessoa certa. Posso fazer a ponte?`,
    confidence: Math.max(72, 88 - position * 4),
  };
}

async function collectToolUse(query, onEvent, signal) {
  let content = [];
  let toolInput = "";

  const stream = client.messages.stream(
    {
      model: MODEL,
      max_tokens: 700,
      temperature: 0.4,
      system: SYSTEM_PROMPT,
      tools: [filterProfilesTool],
      tool_choice: { type: "any" },
      messages: [{ role: "user", content: query }],
    },
    { signal },
  );

  for await (const event of stream) {
    if (event.type === "content_block_start") {
      content[event.index] = event.content_block;
    }

    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      onEvent({ type: "narration", text: event.delta.text });
      content[event.index].text = `${content[event.index].text ?? ""}${event.delta.text}`;
    }

    if (event.type === "content_block_delta" && event.delta.type === "input_json_delta") {
      toolInput += event.delta.partial_json;
    }

    if (event.type === "content_block_stop" && content[event.index]?.type === "tool_use") {
      content[event.index].input = toolInput ? JSON.parse(toolInput) : {};
    }
  }

  const finalMessage = await stream.finalMessage();
  content = finalMessage.content.length ? finalMessage.content : content;
  const toolUse = content.find((block) => block.type === "tool_use");

  return { content, toolUse };
}

async function streamFinalAnswer(query, firstContent, toolUse, toolResult, onEvent, signal) {
  let visibleText = "";
  let finalText = "";
  let jsonMode = false;
  const marker = "MATCHES_JSON:";

  const stream = client.messages.stream(
    {
      model: MODEL,
      max_tokens: 1200,
      temperature: 0.5,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: query },
        { role: "assistant", content: firstContent },
        {
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: JSON.stringify(toolResult),
            },
          ],
        },
      ],
    },
    { signal },
  );

  for await (const event of stream) {
    if (event.type !== "content_block_delta" || event.delta.type !== "text_delta") continue;

    finalText += event.delta.text;

    if (!jsonMode) {
      const nextVisible = `${visibleText}${event.delta.text}`;
      const markerIndex = nextVisible.indexOf(marker);

      if (markerIndex === -1) {
        visibleText = nextVisible;
        onEvent({ type: "narration", text: event.delta.text });
      } else {
        const textBeforeJson = nextVisible.slice(visibleText.length, markerIndex);
        if (textBeforeJson) onEvent({ type: "narration", text: textBeforeJson });
        jsonMode = true;
      }
    }
  }

  return extractJsonAfterMarker(finalText);
}

export async function runAgent(query, profiles, onEvent, options = {}) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is missing");
  }

  onEvent({ type: "narration", text: "Estou a ler o teu pedido. " });
  const { content, toolUse } = await collectToolUse(query, onEvent, options.signal);
  const criteria = toolUse?.input ?? { keywords: query.split(/\s+/).slice(0, 8) };
  const toolResult = filterProfiles(criteria, profiles);

  onEvent({
    type: "narration",
    text: `Encontrei ${toolResult.length} perfis para comparar. `,
  });

  const modelMatches = toolUse
    ? await streamFinalAnswer(query, content, toolUse, toolResult, onEvent, options.signal)
    : null;
  const matches = Array.isArray(modelMatches) && modelMatches.length > 0
    ? modelMatches
    : toolResult.slice(0, 3).map((profile, index) => toMatchFromProfile(profile, query, index));

  matches.slice(0, 3).forEach((match, index) => {
    onEvent({
      type: "match",
      match: {
        id: match.id ?? `match-${index}`,
        name: match.name,
        role: match.role,
        company: match.company,
        city: match.city,
        reason: match.reason,
        intro: match.intro,
        confidence: match.confidence,
      },
    });
  });
}
