"use client";

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
  prompt: "Procuro um mentor para entrar em investment banking em Londres.",
  events: [
    { type: "narration", text: "Olá. Sou a Luma. Vou procurar alumni com carreira em IB em Londres. " },
    { type: "narration", text: "Estou a dar prioridade a quem está actualmente em funções e tem histórico de mentorar candidatos Nova. " },
    {
      type: "match",
      match: {
        id: "mock-mentor-1",
        name: "André Tavares",
        role: "VP Investment Banking",
        company: "Goldman Sachs",
        city: "Londres",
        reason: "Alumni Nova MiF. Já mentorou 4 candidatos da rede nos últimos 18 meses. Conhece bem o processo de assessment center.",
        intro: "Olá André. Tens aqui um candidato Nova SBE interessado em IB em Londres. Estaria à procura de 30 minutos para perceber timing, processo e o que estudar. Aceitas?",
        confidence: 94,
      },
    },
    {
      type: "match",
      match: {
        id: "mock-mentor-2",
        name: "Catarina Lopes",
        role: "Associate, M&A",
        company: "Morgan Stanley",
        city: "Londres",
        reason: "Entrou há 2 anos. Mais próxima da experiência recente de candidatura e dá feedback técnico em modeling.",
        intro: "Olá Catarina. Tenho um candidato Nova que quer entrar em IB e beneficiava da tua experiência recente. 20 minutos de chamada?",
        confidence: 88,
      },
    },
    { type: "done" },
  ],
};

const vcScript: MockScript = {
  prompt: "Sou VC. Quero deal flow em SaaS ibérico nos próximos 6 meses.",
  events: [
    { type: "narration", text: "Olá. Sou a Luma. Vou filtrar fundadores alumni em SaaS, com sede em Portugal ou Espanha. " },
    { type: "narration", text: "Estou a dar prioridade a quem está em fase de captação ou cresceu nos últimos 12 meses. " },
    {
      type: "match",
      match: {
        id: "mock-vc-1",
        name: "Diogo Sousa",
        role: "Co-founder & CEO",
        company: "Stack Health",
        city: "Lisboa",
        reason: "SaaS B2B em saúde digital. Cresceu 3x no último ano. Está a iniciar Series A no próximo trimestre.",
        intro: "Olá Diogo. Tenho aqui um investidor com tese em SaaS ibérico. Faz sentido marcarmos uma chamada inicial de 30 min?",
        confidence: 90,
      },
    },
    {
      type: "match",
      match: {
        id: "mock-vc-2",
        name: "Inês Carvalho",
        role: "Founder",
        company: "Loopa",
        city: "Madrid",
        reason: "Building SaaS de operações para retalho. Pre-seed fechado, perto de Seed. Forte tracção em Espanha.",
        intro: "Olá Inês. Tenho um VC interessado em SaaS ibérico que queria conhecer-te antes da próxima ronda. Faz sentido?",
        confidence: 85,
      },
    },
    { type: "done" },
  ],
};

const adviceScript: MockScript = {
  prompt: "Estou a vender SaaS B2B em saúde. Quem na rede me pode aconselhar?",
  events: [
    { type: "narration", text: "Olá. Sou a Luma. Vou procurar quem na rede vendeu SaaS B2B em saúde ou está perto desse mercado. " },
    { type: "narration", text: "Filtrei por quem teve papéis comerciais ou de produto em healthtech ou clínicas. " },
    {
      type: "match",
      match: {
        id: "mock-advice-1",
        name: "Mariana Pereira",
        role: "VP Sales",
        company: "Doctolib",
        city: "Paris",
        reason: "Vendeu SaaS clínico durante 4 anos. Tem playbook para vender a hospitais privados e grupos clínicos.",
        intro: "Olá Mariana. Tenho um fundador alumni Nova a vender SaaS para saúde e beneficiava muito da tua experiência. 30 min?",
        confidence: 91,
      },
    },
    {
      type: "match",
      match: {
        id: "mock-advice-2",
        name: "Catarina Lopes",
        role: "Operating Partner",
        company: "Indico Capital",
        city: "Lisboa",
        reason: "Apoia portfolio em GTM, com 3 healthtechs activas. Boa para feedback de pricing e ICP.",
        intro: "Olá Catarina. Tens aqui um fundador alumni Nova a vender SaaS em saúde e queria ouvir-te 20 min sobre ICP e pricing.",
        confidence: 84,
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
  if (q.includes("ib") || q.includes("invest") && q.includes("banking") || q.includes("mentor")) return mentorScript;
  if (q.includes("vc") || q.includes("deal flow") || q.includes("investidor")) return vcScript;
  if (q.includes("saúde") || q.includes("saude") || q.includes("health")) return adviceScript;
  return fintechScript;
}

export default function NetworkerPage() {
  const [query, setQuery] = useState("");
  const [narration, setNarration] = useState("");
  const [matches, setMatches] = useState<MatchCard[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [email, setEmail] = useState("");
  const [useMock, setUseMock] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef<string>("");
  const timersRef = useRef<number[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `session-${Math.random().toString(36).slice(2)}`;
    }
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const forceLive = params.get("live") === "1" && CHAT_URL;
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
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [narration, matches, isRunning]);

  function getSessionId() {
    return sessionIdRef.current;
  }

  function resetRun() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
    controllerRef.current?.abort();
    controllerRef.current = null;
  }

  function applyEvent(event: StreamEvent) {
    if (event.type === "narration") {
      setNarration((current) => `${current}${event.text}`);
      return;
    }

    if (event.type === "match") {
      setMatches((current) => [...current, event.match]);
      return;
    }

    if (event.type === "interrupted") {
      setNarration((current) => `${current}\n\n${event.text ?? "Diz-me o que mudar."}`);
      setIsRunning(false);
      return;
    }

    if (event.type === "error") {
      setError(event.text ?? "A agente teve um erro. Tenta outra vez.");
      setIsRunning(false);
      return;
    }

    if (event.type === "done") {
      setIsRunning(false);
    }
  }

  function runMockStream(text: string) {
    const script = pickMockScript(text);
    script.events.forEach((event, index) => {
      const timer = window.setTimeout(() => applyEvent(event), 600 * (index + 1));
      timersRef.current.push(timer);
    });
  }

  function runExample(example: MockScript) {
    if (isRunning) return;
    resetRun();
    setQuery(example.prompt);
    setNarration("");
    setMatches([]);
    setError(null);
    setCopiedId(null);
    setIsRunning(true);
    example.events.forEach((event, index) => {
      const timer = window.setTimeout(() => applyEvent(event), 600 * (index + 1));
      timersRef.current.push(timer);
    });
  }

  async function runLiveStream(text: string) {
    const controller = new AbortController();
    controllerRef.current = controller;

    const response = await fetch(CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: text,
        sessionId: getSessionId(),
        emailMe: emailEnabled ? { email: email.trim() } : undefined,
      }),
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`A agente respondeu com estado ${response.status}.`);
    }

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
        const line = chunk
          .split("\n")
          .find((part) => part.startsWith("data:"));

        if (!line) return;

        try {
          applyEvent(JSON.parse(line.slice(5).trim()) as StreamEvent);
        } catch {
          setError("Recebi uma resposta inválida da agente.");
        }
      });
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = query.trim();
    if (!text || isRunning) return;

    resetRun();
    setNarration("");
    setMatches([]);
    setError(null);
    setCopiedId(null);
    setIsRunning(true);

    if (useMock) {
      runMockStream(text);
      return;
    }

    try {
      await runLiveStream(text);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(caught instanceof Error ? caught.message : "A agente teve um erro.");
      setIsRunning(false);
    }
  }

  async function interrupt() {
    if (!isRunning) return;

    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
    controllerRef.current?.abort();
    setIsRunning(false);
    setNarration((current) => `${current}\n\nDiz-me o que mudar.`);

    if (!useMock) {
      try {
        await fetch(`${CHAT_URL.replace(/\/$/, "")}/${getSessionId()}/interrupt`, {
          method: "POST",
        });
      } catch {
        setError("Interrompi no ecrã, mas o servidor pode continuar por uns segundos.");
      }
    }
  }

  async function copyIntro(match: MatchCard) {
    await navigator.clipboard.writeText(match.intro);
    setCopiedId(match.id ?? match.name);
  }

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-[radial-gradient(ellipse_at_top_left,_rgba(3,63,133,0.11),_transparent_50%)]">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:py-20">
        <section>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#033F85]/20 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#033F85]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#033F85]" />
            Luma. A agente IA da rede Nova SBE Alumni
          </div>
          <h1 className="mt-6 font-serif text-5xl leading-tight text-[color:var(--foreground)] sm:text-6xl">
            Pede uma intro sem perder uma tarde.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[color:var(--muted)]">
            Diz à Luma o que precisas. Ela procura na rede Nova SBE Alumni, explica o raciocínio e prepara as mensagens prontas a copiar.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[color:var(--muted)]">
            Demo. Catálogo limitado a 5 perfis de exemplo, para mostrar como a Luma funciona em produção.
          </p>

          <div className="mt-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#033F85]">Experimenta um cenário</div>
            <div className="flex flex-wrap gap-2">
              {examples.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => runExample(example.script)}
                  disabled={isRunning}
                  className="rounded-full border border-[#033F85]/25 bg-white px-4 py-2 text-sm font-medium text-[#033F85] transition hover:border-[#033F85] hover:bg-[#033F85]/5 disabled:opacity-50"
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={submit} className="mt-6 rounded-3xl border border-[color:var(--border)] bg-white p-5 shadow-[0_24px_70px_-45px_rgba(3,63,133,0.75)]">
            <label className="sr-only" htmlFor="networker-query">
              Pedido de networking
            </label>
            <textarea
              id="networker-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ou escreve aqui o que precisas. Ex: Estou a entrar em consultoria, quem na rede me pode dar conselho?"
              className="min-h-36 w-full resize-none rounded-2xl border border-[color:var(--border)] bg-white px-4 py-4 leading-relaxed outline-none transition focus:border-[#033F85] focus:ring-4 focus:ring-[#033F85]/10"
            />

            <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-[#033F85]/5 p-4">
              <label className="flex cursor-pointer items-start gap-3 text-sm text-[color:var(--foreground)]">
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(event) => setEmailEnabled(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-[color:var(--border)] accent-[#033F85]"
                />
                <span>Posso fechar o portátil? Manda-me por email</span>
              </label>

              {emailEnabled && (
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="O teu email"
                  className="rounded-full border border-[color:var(--border)] px-4 py-3 outline-none transition focus:border-[#033F85]"
                />
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isRunning || !query.trim() || (emailEnabled && !email.trim())}
                className="rounded-full bg-[#033F85] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#022f63] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Pedir à Luma
              </button>

              {isRunning && (
                <button
                  type="button"
                  onClick={interrupt}
                  className="rounded-full border border-[#033F85]/25 bg-white px-5 py-3 text-sm font-semibold text-[#033F85] transition hover:border-[#033F85]"
                >
                  Interromper
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-[color:var(--border)] bg-white p-5 shadow-[0_24px_70px_-45px_rgba(0,0,0,0.35)] sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-[#033F85]">
                Luma
              </div>
              <h2 className="mt-1 font-serif text-3xl text-[color:var(--foreground)]">
                Narrativa e matches
              </h2>
            </div>
            {isRunning && (
              <div className="rounded-full bg-[#033F85]/10 px-3 py-1 text-xs font-semibold text-[#033F85]">
                A escrever
              </div>
            )}
          </div>

          <div className="min-h-[34rem] space-y-5 rounded-2xl bg-[color:var(--primary-50)]/25 p-4">
            {narration || isRunning ? (
              <div className="rounded-2xl border border-[#033F85]/15 bg-white p-5 leading-relaxed text-[color:var(--foreground)] shadow-sm">
                <p className="whitespace-pre-wrap">{narration}</p>
                {isRunning && <span className="mt-3 inline-block h-2 w-2 animate-pulse rounded-full bg-[#033F85]" />}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#033F85]/30 bg-white p-6 leading-relaxed text-[color:var(--foreground)]">
                <p className="font-semibold text-[#033F85]">Olá. Sou a Luma.</p>
                <p className="mt-2 text-[color:var(--muted)]">
                  Sou a agente IA da rede Nova SBE Alumni. Diz-me o que precisas, ou clica num dos cenários ao lado, e procuro entre os alumni quem te pode ajudar. Mostro o raciocínio em directo e preparo a mensagem que podes copiar.
                </p>
              </div>
            )}

            {matches.map((match) => (
              <article key={match.id ?? match.name} className="rounded-2xl border border-[color:var(--border)] bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-2xl text-[color:var(--foreground)]">
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

                <p className="mt-4 leading-relaxed text-[color:var(--foreground)]">
                  {match.reason}
                </p>

                <div className="mt-4 rounded-xl border border-[#033F85]/10 bg-[#033F85]/5 p-4">
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
                  className="mt-4 rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-semibold text-[#033F85] transition hover:border-[#033F85]"
                >
                  {copiedId === (match.id ?? match.name) ? "Copiado" : "Copiar mensagem"}
                </button>
              </article>
            ))}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </section>
      </div>
    </main>
  );
}
