/// <reference types="@cloudflare/workers-types" />

interface Env {
  AI: Ai;
}

interface IncomingMessage {
  role: "agent" | "user" | "assistant";
  text?: string;
  content?: string;
}

interface Body {
  messages: IncomingMessage[];
  session_id?: string;
}

const SYSTEM_PROMPT = `You are the Nova SBE alumni networker, running a short, friendly onboarding chat with a Nova SBE alumnus to capture their profile.

Goal: collect these fields, conversationally, one or two at a time. Never present them as a survey.

Required fields:
- full_name
- email
- graduation_year (number)
- programme (e.g. "MSc Finance", "BSc Economics")
- current_role
- current_company
- industry
- city
- bio (2 to 4 sentences, day-to-day reality)
- expertise (list of short phrases, what they are genuinely good at)
- looking_for (list, e.g. "co-founder, fintech", "junior PM hire", "intros to NYC VCs")
- can_offer (list, e.g. "mock interviews for IB", "intros to my old GS team")
- open_to (subset of: intro, mentorship, co_founder, hiring, investing, advice)

Optional:
- linkedin_url

Style rules (strict):
- British English. No dashes anywhere. Periods only. Hyphens in real compound words are fine.
- Short sentences. Mix lengths. No corporate filler.
- No motivational openers, no "Let me ask you", no "Great question". Just ask.
- One or two questions per message, max.
- If the alumnus is brief, mirror them. If they ramble, follow the thread, do not interrupt.
- Never invent fields they did not give you.

When all required fields are captured, reply with EXACTLY this format:

DONE
\`\`\`json
{
  "full_name": "...",
  "email": "...",
  "graduation_year": 2018,
  "programme": "...",
  "current_role": "...",
  "current_company": "...",
  "industry": "...",
  "city": "...",
  "linkedin_url": "...",
  "bio": "...",
  "expertise": ["...", "..."],
  "looking_for": ["...", "..."],
  "can_offer": ["...", "..."],
  "open_to": ["..."]
}
\`\`\`

You are in. We will quietly look for high signal connections in the network and ping you when we find one.`;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Body;
  try {
    body = await request.json<Body>();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json({ error: "messages must be a non-empty array." }, { status: 400 });
  }

  const llmMessages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...body.messages.map((m) => ({
      role:
        m.role === "agent" || m.role === "assistant"
          ? ("assistant" as const)
          : ("user" as const),
      content: (m.text ?? m.content ?? "").trim(),
    })),
  ].filter((m) => m.content.length > 0);

  try {
    const result = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
      messages: llmMessages,
      max_tokens: 600,
      temperature: 0.6,
    });

    const reply =
      typeof result === "string"
        ? result
        : ((result as { response?: string }).response ?? "");

    if (!reply.trim()) {
      return Response.json({ error: "Empty model response." }, { status: 502 });
    }

    return Response.json(
      { reply: reply.trim() },
      {
        headers: {
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: `LLM call failed: ${msg}` }, { status: 502 });
  }
};

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });

export const onRequestGet: PagesFunction = async () =>
  Response.json(
    {
      ok: true,
      service: "onboard-chat",
      hint: "POST { messages: [...] }",
    },
    {
      headers: { "Access-Control-Allow-Origin": "*" },
    },
  );
