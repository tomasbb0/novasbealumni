"use client";

import Link from "next/link";
import { useState } from "react";
import { mockEvents } from "@/lib/mock";

export default function EventsPage() {
  const [chapter, setChapter] = useState<string>("");
  const [type, setType] = useState<string>("");

  const chapters = Array.from(new Set(mockEvents.map((e) => e.chapter))).sort();
  const types = Array.from(new Set(mockEvents.map((e) => e.type))).sort();

  const filtered = mockEvents.filter((e) => {
    if (chapter && e.chapter !== chapter) return false;
    if (type && e.type !== type) return false;
    return true;
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <header>
        <p className="text-xs uppercase tracking-widest text-[color:var(--primary)]">Events</p>
        <h1 className="mt-2 font-serif text-4xl text-[color:var(--foreground)]">Próximos eventos</h1>
        <p className="mt-1 text-[color:var(--muted)]">{filtered.length} eventos abertos em {chapters.length} chapters</p>
      </header>

      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        <select className={input} value={chapter} onChange={(e) => setChapter(e.target.value)}>
          <option value="">Todos os chapters</option>
          {chapters.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className={input} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Todos os tipos</option>
          {types.map((t) => <option key={t} value={t}>{label(t)}</option>)}
        </select>
      </div>

      <ul className="mt-8 grid md:grid-cols-2 gap-4">
        {filtered.map((e) => {
          const d = new Date(e.date);
          const filled = Math.round((e.attendees / e.capacity) * 100);
          return (
            <li key={e.id} className="rounded-lg border border-[color:var(--border)] bg-white p-5 hover:border-[color:var(--primary)] transition">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-[color:var(--primary)]">{label(e.type)} · {e.chapter}</div>
                  <h3 className="mt-1 font-serif text-lg text-[color:var(--foreground)]">{e.title}</h3>
                </div>
                <DateBadge date={d} />
              </div>
              <p className="mt-3 text-sm text-[color:var(--foreground)]">{e.description}</p>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-[color:var(--muted)]">
                <div><dt className="uppercase tracking-widest">Onde</dt><dd className="text-[color:var(--foreground)]">{e.venue}</dd></div>
                <div><dt className="uppercase tracking-widest">Preço</dt><dd className="text-[color:var(--foreground)]">{e.price || "Gratuito"}</dd></div>
              </dl>
              {e.speakers && e.speakers.length > 0 && (
                <p className="mt-3 text-xs text-[color:var(--muted)]"><span className="uppercase tracking-widest">Speakers</span><br /><span className="text-[color:var(--foreground)]">{e.speakers.join(" · ")}</span></p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <div className="h-1.5 rounded-full bg-[color:var(--primary-50)] overflow-hidden">
                    <div className="h-full bg-[color:var(--primary)]" style={{ width: `${filled}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">{e.attendees} de {e.capacity} lugares</p>
                </div>
                <Link href={`/rsvp?event=${e.id}`} className={btnPrimary}>RSVP</Link>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-12 rounded-lg border border-dashed border-[color:var(--border)] p-4 text-xs text-[color:var(--muted)]">
        Dados de demonstração. No piloto, eventos vêm do Alumni Office e dos chapter leads.
      </div>
    </div>
  );
}

function DateBadge({ date }: { date: Date }) {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return (
    <div className="shrink-0 w-14 text-center rounded-md border border-[color:var(--border)] overflow-hidden">
      <div className="bg-[color:var(--primary)] text-white text-[10px] uppercase tracking-widest py-0.5">{months[date.getUTCMonth()]}</div>
      <div className="text-xl font-serif text-[color:var(--foreground)] py-1">{date.getUTCDate()}</div>
    </div>
  );
}

function label(s: string) {
  const m: Record<string, string> = { talk: "Talk", dinner: "Jantar", panel: "Painel", workshop: "Workshop", social: "Social" };
  return m[s] || s;
}

const input = "w-full rounded-lg border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-[color:var(--foreground)] focus:outline-none focus:border-[color:var(--primary)] transition";
const btnPrimary = "inline-flex items-center rounded-full bg-[color:var(--primary)] px-4 py-2 text-xs font-medium text-white hover:bg-[color:var(--primary-700)] transition";
