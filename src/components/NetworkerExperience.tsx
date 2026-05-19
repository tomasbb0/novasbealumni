"use client";

// shared Luma networker experience, rendered by /agent and (legacy) /networker redirect.

import { FormEvent, useEffect, useRef, useState } from "react";

type MatchCard = {
  id?: string;
  name: string;
  role: string;
  company: string;
  city?: string;
  reason: string;
  intro: string;
  confidence?: number;
};

type StreamEvent =
  | { type: "narration"; text: string }
  | { type: "match"; match: MatchCard }
  | { type: "done" }
  | { type: "interrupted"; text?: string }
  | { type: "error"; text?: string };

type ChatMessage =
  | { role: "user"; id: string; text: string }
  | { role: "luma"; id: string; narration: string; matches: MatchCard[]; running: boolean; error?: string };

const CHAT_URL = process.env.NEXT_PUBLIC_AGENT_CHAT_URL ?? "";

type MockScript = {
  prompt: string;
  events: StreamEvent[];
};

const fintechScript: MockScript = {
  prompt: "Preciso de uma intro em fintech B2B em Berlim. Estou a explorar parcerias para a minha startup.",
  events: [
    { type: "narration", text: "Olá. Sou a Luma. Recebi o pedido. " },
    { type: "narration", text: "Estou a filtrar a rede Nova SBE Alumni por experiência em fintech B2B na Alemanha. " },
    { type: "narration", text: "Tenho 5 perfis de exemplo neste demo. Estou a procurar a melhor correspondência. " },
    { type: "narration", text: "Encontrei a Inês. Está em Berlim, trabalha em fintech B2B e já fez intros para alumni no passado. " },
    {
      type: "match",
      match: {
        id: "mock-fintech-1",
        name: "Inês Carvalho",
        role: "Head of Partnerships",
        company: "Moss",
        city: "Berlim",
        reason: "Trabalha em fintech B2B na Moss, gere parcerias com bancos e ERPs e tem boa taxa de resposta a pedidos da rede Nova.",
        intro: "Olá Inês. Tenho aqui um alumno que está a explorar parcerias para a startup dele em fintech B2B e queria ouvir-te 20 minutos sobre como pensar a abordagem ao mercado alemão. Faz-te sentido?",
        confidence: 92,
      },
    },
    { type: "narration", text: "Adicionei mais dois nomes complementares, ambos com ligação a payments e SaaS B2B na Europa. " },
    {
      type: "match",
      match: {
        id: "mock-fintech-2",
        name: "Diogo Sousa",
        role: "Product Lead, Payments",
        company: "Adyen",
        city: "Amesterdão",
        reason: "Liderou produto em payments. Útil para validar tese, pricing e ciclo de venda B2B com bancos.",
        intro: "Olá Diogo. Tenho um alumno Nova a montar uma fintech B2B e queria pedir-te 20 minutos para discutir pricing e ciclo de venda. Estás disponível?",
        confidence: 87,
      },
    },
    {
      type: "match",
      match: {
        id: "mock-fintech-3",
        name: "Mariana Pereira",
        role: "Principal",
        company: "Northzone",
        city: "Lisboa",
        reason: "Investe em B2B SaaS e fintech. Pode dar-te perspectiva de investidor e sugerir mais 3 ou 4 nomes na rede dela.",
        intro: "Olá Mariana. Tenho um fundador alumni Nova SBE a explorar fintech B2B na Alemanha. Disponível para uma conversa de 20 min para feedback de tese?",
        confidence: 81,
      },
    },
    { type: "done" },
  ],
};

const mentorScript: MockScript = {
  prompt: "Procuro um mentor que tenha entrado em investment banking em Londres. Quero perceber como prepararam os processos.",
  events: [
    { type: "narration", text: "Olá. Sou a Luma. Estou a procurar mentores que tenham entrado em IB em Londres. " },
    { type: "narration", text: "Foco em pessoas que fizeram o processo recentemente e que respondem a pedidos da rede. " },
    {
      type: "match",
      match: {
        id: "mock-ib-1",
        name: "Rui Marques",
        role: "Associate",
        company: "Goldman Sachs",
        city: "Londres",
        reason: "Fez verão na Goldman, voltou full-time. Já mentorou 4 alumni Nova SBE para processos de IB em Londres.",
        intro: "Olá Rui. Sou alumno Nova SBE e estou a preparar processos para IB em Londres. Tinhas 25 minutos para me partilhares como te organizaste?",
        confidence: 94,
      },
    },
    { type: "narration", text: "Tenho ainda mais duas pessoas em coverage e M&A que podem ajudar. " },
    {
      type: "match",
      match: {
        id: "mock-ib-2",
        name: "Catarina Lopes",
        role: "Analyst",
        company: "Morgan Stanley",
        city: "Londres",
        reason: "Saída direta do mestrado Nova SBE para IB em Londres. Útil para o ponto de vista de quem acabou de passar pelo processo.",
        intro: "Olá Catarina. Sou alumno Nova SBE e estou a candidatar-me a IB em Londres. Disponível para 20 minutos para me partilhares a experiência do processo?",
        confidence: 89,
      },
    },
    { type: "done" },
  ],
};

const vcScript: MockScript = {
  prompt: "Sou VC. Procuro deal flow em SaaS B2B ibérico. Quem na rede pode introduzir-me a fundadores no estágio seed?",
  events: [
    { type: "narration", text: "Olá. Sou a Luma. Estou a interpretar o pedido como uma procura de deal flow ibérico em SaaS B2B seed. " },
    { type: "narration", text: "A filtrar fundadores e operadores ligados a SaaS B2B com sede em Portugal ou Espanha. " },
    {
      type: "match",
      match: {
        id: "mock-vc-1",
        name: "André Tavares",
        role: "CEO e fundador",
        company: "Sequoia (SaaS B2B logística)",
        city: "Lisboa",
        reason: "Fundador SaaS B2B em fase seed, com rede forte de outros fundadores ibéricos. Pode introduzir 4 a 6 nomes.",
        intro: "Olá André. Estou a mapear deal flow SaaS B2B ibérico em estágio seed. Tinhas 25 minutos para uma chamada e, se fizer sentido, intros para outros fundadores da tua rede?",
        confidence: 90,
      },
    },
    { type: "narration", text: "Adicionei também um operador sénior com bom mapa do ecossistema. " },
    {
      type: "match",
      match: {
        id: "mock-vc-2",
        name: "Helena Costa",
        role: "VP Marketing",
        company: "Talkdesk",
        city: "Lisboa",
        reason: "Operadora SaaS B2B com visibilidade sobre o ecossistema ibérico. Costuma indicar fundadores na fase seed.",
        intro: "Olá Helena. Estou a procurar deal flow SaaS B2B ibérico no estágio seed. Disponível para 20 minutos e, se fizer sentido, intros aos fundadores que vês a destacar-se?",
        confidence: 84,
      },
    },
    { type: "done" },
  ],
};

const adviceScript: MockScript = {
  prompt: "Quero aconselhamento para entrar em SaaS na área da saúde. Quem na rede tem essa experiência?",
  events: [
    { type: "narration", text: "Olá. Sou a Luma. A entender o pedido como aconselhamento para SaaS em saúde. " },
    { type: "narration", text: "A procurar alumni com experiência em healthtech, RWD ou software clínico. " },
    {
      type: "match",
      match: {
        id: "mock-health-1",
        name: "Sofia Antunes",
        role: "VP Product",
        company: "Doctolib",
        city: "Berlim",
        reason: "Lidera produto numa healthtech europeia. Pode partilhar como pensar GTM em hospitais, ciclo de venda e regulação.",
        intro: "Olá Sofia. Sou alumno Nova SBE a explorar SaaS em saúde. Tinhas 25 minutos para me ajudares a pensar GTM e ciclo de venda em hospitais?",
        confidence: 88,
      },
    },
    {
      type: "match",
      match: {
        id: "mock-health-2",
        name: "Pedro Almeida",
        role: "Founder",
        company: "Sword Health (early team)",
        city: "Porto",
        reason: "Esteve no early team de uma healthtech ibérica que escalou globalmente. Útil para perceber product-market fit em healthtech.",
        intro: "Olá Pedro. Sou alumno Nova SBE a explorar SaaS em saúde. Disponível para 20 minutos para partilhares como pensam product-market fit em healthtech?",
        confidence: 85,
      },
    },
    { type: "done" },
  ],
};

const examples: { label: string; script: MockScript }[] = [
  { label: "Intro em fintech B2B em Berlim", script: fintechScript },
  { label: "Mentor para entrar em IB Londres", script: mentorScript },
  { label: "Deal flow SaaS ibérico", script: vcScript },
  { label: "Aconselhamento SaaS em saúde", script: adviceScript },
];

function pickMockScript(query: string): MockScript {
  const q = query.toLowerCase();
  if (q.includes("ib") || (q.includes("invest") && q.includes("banking")) || q.includes("mentor")) return mentorScript;
  if (q.includes("vc") || q.includes("deal flow") || q.includes("investidor")) return vcScript;
  if (q.includes("saúde") || q.includes("saude") || q.includes("health")) return adviceScript;
  return fintechScript;
}

function genId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

export default function NetworkerExperience() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [email, setEmail] = useState("");
  const [useMock, setUseMock] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef<string>("");
  const timersRef = useRef<number[]>([]);
  const threadRef = useRef<HTMLDivElement>(null);
  const activeLumaIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionIdRef.current) sessionIdRef.current = genId("session");
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const forceLive = CHAT_URL && params.get("mock") !== "1";
      setUseMock(!forceLive);
      const exampleParam = params.get("example");
      if (exampleParam !== null) {
        const idx = Number(exampleParam);
        if (Number.isInteger(idx) && idx >= 0 && idx < examples.length) {
          runExample(examples[idx].script);
        }
      }
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isRunning]);

  function resetTimers() {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    controllerRef.current?.abort();
    controllerRef.current = null;
  }

  function updateLuma(updater: (msg: Extract<ChatMessage, { role: "luma" }>) => Extract<ChatMessage, { role: "luma" }>) {
    const id = activeLumaIdRef.current;
    if (!id) return;
    setMessages((current) =>
      current.map((m) => (m.role === "luma" && m.id === id ? updater(m) : m))
    );
  }

  function applyEvent(event: StreamEvent) {
    if (event.type === "narration") {
      updateLuma((m) => ({ ...m, narration: m.narration + event.text }));
      return;
    }
    if (event.type === "match") {
      updateLuma((m) => ({ ...m, matches: [...m.matches, event.match] }));
      return;
    }
    if (event.type === "interrupted") {
      updateLuma((m) => ({ ...m, narration: `${m.narration}\n\n${event.text ?? "Diz-me o que mudar."}`, running: false }));
      setIsRunning(false);
      return;
    }
    if (event.type === "error") {
      updateLuma((m) => ({ ...m, error: event.text ?? "A agente teve um erro.", running: false }));
      setIsRunning(false);
      return;
    }
    if (event.type === "done") {
      updateLuma((m) => ({ ...m, running: false }));
      setIsRunning(false);
    }
  }

  function startTurn(userText: string): string {
    resetTimers();
    const userMsg: ChatMessage = { role: "user", id: genId("user"), text: userText };
    const lumaId = genId("luma");
    const lumaMsg: ChatMessage = { role: "luma", id: lumaId, narration: "", matches: [], running: true };
    activeLumaIdRef.current = lumaId;
    setMessages((current) => [...current, userMsg, lumaMsg]);
    setIsRunning(true);
    return lumaId;
  }

  function scheduleScript(script: MockScript) {
    script.events.forEach((event, index) => {
      const timer = window.setTimeout(() => applyEvent(event), 500 * (index + 1));
      timersRef.current.push(timer);
    });
  }

  function runExample(example: MockScript) {
    if (isRunning) return;
    setQuery("");
    startTurn(example.prompt);
    scheduleScript(example);
  }

  async function runLiveStream(text: string) {
    const controller = new AbortController();
    controllerRef.current = controller;
    const response = await fetch(CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: text,
        sessionId: sessionIdRef.current,
        emailMe: emailEnabled ? { email: email.trim() } : undefined,
      }),
      signal: controller.signal,
    });
    if (!response.ok || !response.body) throw new Error(`A agente respondeu com estado ${response.status}.`);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split("\n\n");
      buffer = chunks.pop() ?? "";
      chunks.forEach((chunk) => {
        const line = chunk.split("\n").find((p) => p.startsWith("data:"));
        if (!line) return;
        try {
          applyEvent(JSON.parse(line.slice(5).trim()) as StreamEvent);
        } catch {
          updateLuma((m) => ({ ...m, error: "Resposta inválida da agente.", running: false }));
        }
      });
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = query.trim();
    if (!text || isRunning) return;
    setQuery("");
    startTurn(text);
    if (useMock) {
      scheduleScript(pickMockScript(text));
      return;
    }
    try {
      await runLiveStream(text);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      updateLuma((m) => ({ ...m, error: caught instanceof Error ? caught.message : "A agente teve um erro.", running: false }));
      setIsRunning(false);
    }
  }

  async function interrupt() {
    if (!isRunning) return;
    resetTimers();
    updateLuma((m) => ({ ...m, narration: `${m.narration}\n\nDiz-me o que mudar.`, running: false }));
    setIsRunning(false);
    if (!useMock) {
      try {
        await fetch(`${CHAT_URL.replace(/\/$/, "")}/${sessionIdRef.current}/interrupt`, { method: "POST" });
      } catch {
        /* server may keep running briefly; ignore */
      }
    }
  }

  async function copyIntro(match: MatchCard) {
    await navigator.clipboard.writeText(match.intro);
    setCopiedId(match.id ?? match.name);
  }

  const isEmpty = messages.length === 0;

  return (
    <main className="relative min-h-[calc(100vh-8rem)]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_rgba(3,63,133,0.11),_transparent_50%)]" />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <header className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#033F85]/20 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#033F85]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#033F85]" />
            Luma. A agente IA da rede Nova SBE Alumni
          </div>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-[color:var(--foreground)] sm:text-5xl">
            Pede uma intro sem perder uma tarde.
          </h1>
          <p className="mt-3 text-base text-[color:var(--muted)]">
            Demo com 5 perfis de exemplo. Diz à Luma o que precisas ou clica num cenário.
          </p>
        </header>

        <div
          ref={threadRef}
          className="flex max-h-[60vh] min-h-[24rem] flex-col gap-4 overflow-y-auto rounded-3xl border border-[color:var(--border)] bg-white p-4 shadow-[0_24px_70px_-45px_rgba(3,63,133,0.55)] sm:p-6"
        >
          {isEmpty && (
            <div className="m-auto max-w-md text-center text-[color:var(--muted)]">
              <p className="font-serif text-2xl text-[#033F85]">Olá. Sou a Luma.</p>
              <p className="mt-3 text-sm">
                Diz-me o que precisas, ou começa por um destes cenários:
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {examples.map((example, idx) => (
                  <button
                    key={example.label}
                    type="button"
                    onClick={() => runExample(example.script)}
                    disabled={isRunning}
                    className="rounded-full border border-[#033F85]/25 bg-white px-3 py-1.5 text-xs font-medium text-[#033F85] transition hover:border-[#033F85] hover:bg-[#033F85]/5 disabled:opacity-50"
                  >
                    {idx + 1}. {example.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => {
            if (msg.role === "user") {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#033F85] px-4 py-3 text-white shadow-sm">
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className="flex justify-start">
                <div className="w-full max-w-[95%] space-y-4">
                  <div className="rounded-2xl rounded-bl-md border border-[#033F85]/15 bg-[color:var(--primary-50)]/30 px-4 py-3 leading-relaxed text-[color:var(--foreground)] shadow-sm">
                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#033F85]">
                      Luma
                    </div>
                    <p className="whitespace-pre-wrap">{msg.narration || (msg.running ? "A pensar…" : "")}</p>
                    {msg.running && (
                      <span className="mt-2 inline-block h-2 w-2 animate-pulse rounded-full bg-[#033F85]" />
                    )}
                    {msg.error && (
                      <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {msg.error}
                      </p>
                    )}
                  </div>

                  {msg.matches.map((match) => (
                    <article key={match.id ?? match.name} className="rounded-2xl border border-[color:var(--border)] bg-white p-4 shadow-sm sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-serif text-xl text-[color:var(--foreground)] sm:text-2xl">
                            {match.name}
                          </h3>
                          <p className="mt-1 text-sm text-[color:var(--muted)]">
                            {match.role}, {match.company}{match.city ? `, ${match.city}` : ""}
                          </p>
                        </div>
                        {match.confidence && (
                          <span className="rounded-full bg-[#033F85]/10 px-3 py-1 text-xs font-semibold text-[#033F85]">
                            {match.confidence}% fit
                          </span>
                        )}
                      </div>
                      <p className="mt-3 leading-relaxed text-[color:var(--foreground)]">{match.reason}</p>
                      <div className="mt-3 rounded-xl border border-[#033F85]/10 bg-[#033F85]/5 p-3 sm:p-4">
                        <div className="text-xs font-semibold uppercase tracking-widest text-[#033F85]">
                          Mensagem sugerida
                        </div>
                        <p className="mt-2 whitespace-pre-wrap leading-relaxed text-[color:var(--foreground)]">
                          {match.intro}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void copyIntro(match)}
                        className="mt-3 rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-semibold text-[#033F85] transition hover:border-[#033F85]"
                      >
                        {copiedId === (match.id ?? match.name) ? "Copiado" : "Copiar mensagem"}
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-[color:var(--border)] bg-white p-4 shadow-[0_24px_70px_-45px_rgba(3,63,133,0.55)] sm:p-5">
          <label className="sr-only" htmlFor="networker-query">
            Pedido de networking
          </label>
          <textarea
            id="networker-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Diz à Luma o que precisas. Ex: Quero uma intro a um fundador de SaaS B2B em Berlim."
            className="min-h-20 w-full resize-none rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 leading-relaxed outline-none transition focus:border-[#033F85] focus:ring-4 focus:ring-[#033F85]/10"
          />
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[color:var(--muted)]">
              <input
                type="checkbox"
                checked={emailEnabled}
                onChange={(event) => setEmailEnabled(event.target.checked)}
                className="h-4 w-4 rounded border-[color:var(--border)] accent-[#033F85]"
              />
              <span>Manda por email</span>
              {emailEnabled && (
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="O teu email"
                  className="ml-2 rounded-full border border-[color:var(--border)] px-3 py-1.5 text-sm outline-none focus:border-[#033F85]"
                />
              )}
            </label>
            <div className="flex items-center gap-2">
              {isRunning && (
                <button
                  type="button"
                  onClick={interrupt}
                  className="rounded-full border border-[#033F85]/25 bg-white px-4 py-2 text-sm font-semibold text-[#033F85] transition hover:border-[#033F85]"
                >
                  Interromper
                </button>
              )}
              <button
                type="submit"
                disabled={isRunning || !query.trim() || (emailEnabled && !email.trim())}
                className="rounded-full bg-[#033F85] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#022f63] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Pedir à Luma
              </button>
            </div>
          </div>
        </form>

        <div className="mt-4 flex items-center justify-center gap-4 rounded-2xl border border-[color:var(--border)] bg-white/70 px-4 py-3 text-xs text-[color:var(--muted)]">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=0&data=https%3A%2F%2Fweb.whatsapp.com%2F"
            alt="QR para web.whatsapp.com"
            width={72}
            height={72}
            className="rounded-md"
          />
          <div className="flex flex-col gap-0.5">
            <span className="text-[color:var(--foreground)] font-medium">Abrir WhatsApp Web</span>
            <span>Aponta o telemóvel para o código e abre o web.whatsapp.com.</span>
          </div>
        </div>
      </div>
    </main>
  );
}
