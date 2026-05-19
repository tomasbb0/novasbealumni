"use client";

import { useState } from "react";
import { mockMentors, type MockMentor } from "@/lib/mock";

export default function MentoringPage() {
  const [topic, setTopic] = useState<string>("");
  const [availability, setAvailability] = useState<string>("");
  const [selected, setSelected] = useState<MockMentor | null>(null);

  const topics = Array.from(new Set(mockMentors.flatMap((m) => m.topics))).sort();

  const filtered = mockMentors.filter((m) => {
    if (topic && !m.topics.includes(topic)) return false;
    if (availability && m.availability !== availability) return false;
    return true;
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <header>
        <p className="text-xs uppercase tracking-widest text-[color:var(--primary)]">Mentoring</p>
        <h1 className="mt-2 font-serif text-4xl text-[color:var(--foreground)]">Encontra o teu mentor</h1>
        <p className="mt-1 text-[color:var(--muted)]">{filtered.length} mentores Nova SBE prontos para conversar</p>
      </header>

      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        <select className={input} value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="">Qualquer tema</option>
          {topics.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className={input} value={availability} onChange={(e) => setAvailability(e.target.value)}>
          <option value="">Qualquer disponibilidade</option>
          <option value="open">Disponível</option>
          <option value="limited">Vagas limitadas</option>
        </select>
      </div>

      <div className="mt-8 grid lg:grid-cols-[1fr_380px] gap-8">
        <ul className="grid sm:grid-cols-2 gap-3">
          {filtered.map((m) => (
            <li key={m.id}>
              <button onClick={() => setSelected(m)} className={`w-full text-left rounded-lg border p-4 transition ${selected?.id === m.id ? "border-[color:var(--primary)] bg-[color:var(--primary-50)]" : "border-[color:var(--border)] bg-white hover:border-[color:var(--primary)]"}`}>
                <div className="flex items-start gap-3">
                  <Avatar initials={m.initials} />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-[color:var(--foreground)] truncate">{m.name}</div>
                    <div className="text-xs text-[color:var(--muted)] truncate">{m.role}</div>
                    <div className="text-xs text-[color:var(--muted)] truncate">{m.company} · {m.city}</div>
                  </div>
                  <Pill state={m.availability} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {m.topics.slice(0, 2).map((t) => <span key={t} className="text-[10px] rounded-full bg-[color:var(--primary-50)] text-[color:var(--primary)] px-2 py-0.5">{t}</span>)}
                </div>
              </button>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-20 self-start">
          {selected ? <MentorPanel m={selected} /> : (
            <div className="rounded-lg border border-dashed border-[color:var(--border)] p-6 text-sm text-[color:var(--muted)]">
              Escolhe um mentor à esquerda para ver detalhes e pedir uma sessão.
            </div>
          )}
        </aside>
      </div>

      <div className="mt-12 rounded-lg border border-dashed border-[color:var(--border)] p-4 text-xs text-[color:var(--muted)]">
        Mentores sintéticos para demonstração. No piloto, o registo é voluntário e ligado ao perfil real do alumnus.
      </div>
    </div>
  );
}

function MentorPanel({ m }: { m: MockMentor }) {
  const [sent, setSent] = useState(false);
  const [topic, setTopic] = useState(m.topics[0]);
  const [msg, setMsg] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="rounded-lg border border-[color:var(--border)] bg-white p-6">
      <div className="flex items-center gap-3">
        <Avatar initials={m.initials} size={56} />
        <div className="min-w-0">
          <div className="font-serif text-xl text-[color:var(--foreground)] truncate">{m.name}</div>
          <div className="text-xs text-[color:var(--muted)] truncate">{m.role} · {m.company}</div>
        </div>
      </div>
      <p className="mt-4 text-sm text-[color:var(--foreground)]">{m.bio}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div><dt className="uppercase tracking-widest text-[color:var(--muted)]">Programa</dt><dd className="text-[color:var(--foreground)]">{m.programme} {m.gradYear}</dd></div>
        <div><dt className="uppercase tracking-widest text-[color:var(--muted)]">Resposta</dt><dd className="text-[color:var(--foreground)]">{m.responseRate}%</dd></div>
      </dl>
      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-widest text-[color:var(--muted)]">Temas</div>
        <div className="mt-1 flex flex-wrap gap-1">{m.topics.map((t) => <span key={t} className="text-[10px] rounded-full bg-[color:var(--primary-50)] text-[color:var(--primary)] px-2 py-0.5">{t}</span>)}</div>
      </div>

      {sent ? (
        <div className="mt-5 rounded-md bg-[color:var(--primary-50)] p-3 text-xs text-[color:var(--primary)]">
          Pedido enviado. {m.name} responde em média em {Math.round(100 / m.responseRate * 3)} dias.
        </div>
      ) : m.availability === "full" ? (
        <p className="mt-5 text-xs text-[color:var(--muted)]">Sem vagas no momento. Volta dentro de algumas semanas.</p>
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-2">
          <select className={input} value={topic} onChange={(e) => setTopic(e.target.value)}>
            {m.topics.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <textarea className={input + " min-h-[80px]"} placeholder="O que queres discutir? Sê concreto." value={msg} onChange={(e) => setMsg(e.target.value)} required />
          <button type="submit" className={btnPrimary + " w-full justify-center"}>Pedir sessão de mentoria</button>
        </form>
      )}
    </div>
  );
}

function Avatar({ initials, size = 40 }: { initials: string; size?: number }) {
  return (
    <div className="rounded-full bg-[color:var(--primary-50)] flex items-center justify-center text-[color:var(--primary)] font-medium" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {initials}
    </div>
  );
}

function Pill({ state }: { state: "open" | "limited" | "full" }) {
  const map = {
    open: { label: "Disponível", cls: "bg-green-100 text-green-700" },
    limited: { label: "Limitado", cls: "bg-amber-100 text-amber-700" },
    full: { label: "Cheio", cls: "bg-neutral-200 text-neutral-600" },
  } as const;
  const { label, cls } = map[state];
  return <span className={`text-[10px] rounded-full px-2 py-0.5 ${cls}`}>{label}</span>;
}

const input = "w-full rounded-lg border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-[color:var(--foreground)] focus:outline-none focus:border-[color:var(--primary)] transition";
const btnPrimary = "inline-flex items-center rounded-full bg-[color:var(--primary)] px-4 py-2 text-xs font-medium text-white hover:bg-[color:var(--primary-700)] transition";
