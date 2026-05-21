"use client";

import { useState } from "react";

const ADVISORS = [
  { name: "Margarida Pereira", role: "Senior Careers Advisor", focus: "Banca, Consultoria, M&A", years: "12+ anos", initials: "MP" },
  { name: "Ricardo Almeida", role: "Tech & Startups Lead", focus: "Product, Engineering, GTM", years: "8 anos", initials: "RA" },
  { name: "Inês Carvalho", role: "Industry Partnerships", focus: "FMCG, Retail, Energy", years: "10 anos", initials: "IC" },
  { name: "Pedro Sá", role: "International Careers", focus: "EU, UK, USA, LATAM", years: "9 anos", initials: "PS" },
];

const SERVICES = [
  { title: "CV review", desc: "Feedback estruturado em 48h. Versão revista com tracked changes e nota final." },
  { title: "1:1 mock interview", desc: "30 min com advisor da área (consulting case, finance technicals, tech behavioural)." },
  { title: "Career strategy", desc: "Sessão de 60 min para mapear próximo passo, timing e short-list de empresas." },
  { title: "Salary negotiation", desc: "Briefing antes de assinares: ranges de mercado Nova SBE, scripts e timing." },
  { title: "LinkedIn audit", desc: "Headline, about, experience reescritos com keywords da tua indústria." },
  { title: "Internal referrals", desc: "Acesso à rede de 21k+ alumni para warm intros em empresas concretas." },
];

export default function CareersPage() {
  const [topic, setTopic] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      <header>
        <p className="text-xs uppercase tracking-widest text-[color:var(--primary)]">Careers</p>
        <h1 className="mt-2 font-serif text-4xl text-[color:var(--foreground)]">Consultoria de carreira gratuita</h1>
        <p className="mt-2 max-w-2xl text-[color:var(--muted)]">
          Acesso directo ao Nova SBE Careers Department. Sessões 1:1 com advisors da escola, CV review, mock interviews e introductions na rede alumni. Sem custo para sócios do Alumni Club.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-[color:var(--foreground)]">O que podes pedir</h2>
        <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SERVICES.map((s) => (
            <li key={s.title} className="rounded-xl border border-[color:var(--border)] bg-white p-4">
              <div className="font-medium text-[color:var(--foreground)]">{s.title}</div>
              <p className="mt-1 text-sm text-[color:var(--muted)]">{s.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl text-[color:var(--foreground)]">Advisors disponíveis</h2>
        <ul className="mt-4 grid sm:grid-cols-2 gap-3">
          {ADVISORS.map((a) => (
            <li key={a.name} className="rounded-xl border border-[color:var(--border)] bg-white p-4 flex gap-3 items-start">
              <div className="h-10 w-10 rounded-full bg-[color:var(--primary-50)] text-[color:var(--primary)] grid place-items-center font-medium text-sm shrink-0">{a.initials}</div>
              <div className="min-w-0">
                <div className="font-medium text-[color:var(--foreground)]">{a.name}</div>
                <div className="text-xs text-[color:var(--muted)]">{a.role} · {a.years}</div>
                <div className="text-xs text-[color:var(--muted)] mt-1">Foco: {a.focus}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 max-w-2xl">
        <h2 className="font-serif text-2xl text-[color:var(--foreground)]">Pedir sessão</h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">A equipa responde em 2 dias úteis com slots disponíveis.</p>

        {submitted ? (
          <div className="mt-6 rounded-xl border border-[color:var(--border)] bg-[color:var(--primary-50)] p-5">
            <p className="text-sm text-[color:var(--foreground)]">Pedido enviado. Vais receber email com 3 slots no teu inbox em 2 dias úteis.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wide text-[color:var(--muted)]">Tipo de sessão</label>
              <select
                className="mt-1 w-full rounded-lg border border-[color:var(--border)] bg-white px-3 py-2 text-sm"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              >
                <option value="">Escolhe…</option>
                {SERVICES.map((s) => <option key={s.title} value={s.title}>{s.title}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide text-[color:var(--muted)]">Preferência de data</label>
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-[color:var(--border)] bg-white px-3 py-2 text-sm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide text-[color:var(--muted)]">Contexto</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-[color:var(--border)] bg-white px-3 py-2 text-sm min-h-[120px]"
                placeholder="Ex: estou a candidatar-me a Associate consultant na McKinsey, próxima ronda de cases na semana de 10/06"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[color:var(--primary)] text-white text-sm font-medium hover:opacity-90 transition"
            >
              Enviar pedido
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
