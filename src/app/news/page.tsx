"use client";

import { useState } from "react";
import { mockNews } from "@/lib/mock";

export default function NewsPage() {
  const [category, setCategory] = useState<string>("");
  const categories = Array.from(new Set(mockNews.map((n) => n.category))).sort();
  const filtered = mockNews.filter((n) => !category || n.category === category);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <header>
        <p className="text-xs uppercase tracking-widest text-[color:var(--primary)]">News & Spotlights</p>
        <h1 className="mt-2 font-serif text-4xl text-[color:var(--foreground)]">O que se passa na comunidade</h1>
        <p className="mt-1 text-[color:var(--muted)]">{filtered.length} histórias</p>
      </header>

      <div className="mt-6 flex gap-2 flex-wrap">
        <button onClick={() => setCategory("")} className={chip(category === "")}>Tudo</button>
        {categories.map((c) => <button key={c} onClick={() => setCategory(c)} className={chip(category === c)}>{c}</button>)}
      </div>

      <ul className="mt-8 space-y-4">
        {filtered.map((n) => (
          <li key={n.id} className="rounded-lg border border-[color:var(--border)] bg-white p-5 hover:border-[color:var(--primary)] transition">
            <div className="text-[10px] uppercase tracking-widest text-[color:var(--primary)]">{n.category}</div>
            <h3 className="mt-1 font-serif text-xl text-[color:var(--foreground)]">{n.title}</h3>
            <p className="mt-2 text-sm text-[color:var(--foreground)]">{n.excerpt}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-[color:var(--muted)]">
              <span>{n.author} · {new Date(n.publishedAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })}</span>
              <span>{n.readMinutes} min de leitura</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-12 rounded-lg border border-dashed border-[color:var(--border)] p-4 text-xs text-[color:var(--muted)]">
        Conteúdo de demonstração. Luma pode personalizar a feed de cada alumnus consoante o perfil e interesses.
      </div>
    </div>
  );
}

function chip(active: boolean) {
  return `text-xs rounded-full px-3 py-1.5 border transition ${active ? "bg-[color:var(--primary)] text-white border-[color:var(--primary)]" : "bg-white text-[color:var(--foreground)] border-[color:var(--border)] hover:border-[color:var(--primary)]"}`;
}
