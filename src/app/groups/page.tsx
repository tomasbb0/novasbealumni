"use client";

import { useState } from "react";
import { mockGroups } from "@/lib/mock";

export default function GroupsPage() {
  const [type, setType] = useState<string>("");
  const filtered = mockGroups.filter((g) => !type || g.type === type);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <header>
        <p className="text-xs uppercase tracking-widest text-[color:var(--primary)]">Groups</p>
        <h1 className="mt-2 font-serif text-4xl text-[color:var(--foreground)]">Chapters e subcomunidades</h1>
        <p className="mt-1 text-[color:var(--muted)]">{filtered.length} grupos activos</p>
      </header>

      <div className="mt-6 flex gap-2 flex-wrap">
        <button onClick={() => setType("")} className={chip(type === "")}>Todos</button>
        <button onClick={() => setType("chapter")} className={chip(type === "chapter")}>Chapters</button>
        <button onClick={() => setType("interest")} className={chip(type === "interest")}>Interesse</button>
        <button onClick={() => setType("programme")} className={chip(type === "programme")}>Programa</button>
      </div>

      <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((g) => (
          <li key={g.id} className="rounded-lg border border-[color:var(--border)] bg-white p-5 hover:border-[color:var(--primary)] transition">
            <div className="text-[10px] uppercase tracking-widest text-[color:var(--primary)]">{typeLabel(g.type)}{g.city ? ` · ${g.city}` : ""}</div>
            <h3 className="mt-1 font-serif text-lg text-[color:var(--foreground)]">{g.name}</h3>
            <p className="mt-2 text-sm text-[color:var(--foreground)]">{g.description}</p>
            <p className="mt-3 text-xs text-[color:var(--muted)]">{g.members.toLocaleString("pt-PT")} membros</p>
            <p className="mt-1 text-xs text-[color:var(--muted)]">Lideram: <span className="text-[color:var(--foreground)]">{g.leaders.join(", ")}</span></p>
            <button className={btnGhost + " mt-4 w-full justify-center"}>Juntar-me</button>
          </li>
        ))}
      </ul>

      <div className="mt-12 rounded-lg border border-dashed border-[color:var(--border)] p-4 text-xs text-[color:var(--muted)]">
        Dados de demonstração. No piloto, novos chapters e grupos de interesse podem ser propostos por qualquer alumnus.
      </div>
    </div>
  );
}

function typeLabel(t: string) {
  return ({ chapter: "Chapter", interest: "Interesse", programme: "Programa" } as Record<string, string>)[t] || t;
}

function chip(active: boolean) {
  return `text-xs rounded-full px-3 py-1.5 border transition ${active ? "bg-[color:var(--primary)] text-white border-[color:var(--primary)]" : "bg-white text-[color:var(--foreground)] border-[color:var(--border)] hover:border-[color:var(--primary)]"}`;
}

const btnGhost = "inline-flex items-center rounded-full border border-[color:var(--border)] px-4 py-2 text-xs font-medium text-[color:var(--foreground)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] transition";
