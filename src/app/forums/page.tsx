"use client";

import { useState } from "react";
import { mockThreads, type MockThread } from "@/lib/mock";

export default function ForumsPage() {
  const [forum, setForum] = useState<string>("");
  const [selected, setSelected] = useState<MockThread | null>(null);

  const forums = Array.from(new Set(mockThreads.map((t) => t.forum))).sort();
  const filtered = mockThreads.filter((t) => !forum || t.forum === forum);

  if (selected) return <ThreadView thread={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <header>
        <p className="text-xs uppercase tracking-widest text-[color:var(--primary)]">Forums</p>
        <h1 className="mt-2 font-serif text-4xl text-[color:var(--foreground)]">Conversa entre alumni</h1>
        <p className="mt-1 text-[color:var(--muted)]">{filtered.length} tópicos activos · {forums.length} forums</p>
      </header>

      <div className="mt-6 flex gap-3 flex-wrap">
        <button onClick={() => setForum("")} className={chip(forum === "")}>Todos</button>
        {forums.map((f) => <button key={f} onClick={() => setForum(f)} className={chip(forum === f)}>{f}</button>)}
      </div>

      <ul className="mt-8 divide-y divide-[color:var(--border)] rounded-lg border border-[color:var(--border)] bg-white overflow-hidden">
        {filtered.map((t) => (
          <li key={t.id}>
            <button onClick={() => setSelected(t)} className="w-full text-left p-5 hover:bg-[color:var(--primary-50)] transition">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-widest text-[color:var(--primary)]">{t.forum}</div>
                  <h3 className="mt-1 font-serif text-lg text-[color:var(--foreground)]">{t.title}</h3>
                  <p className="mt-1 text-sm text-[color:var(--muted)] line-clamp-1">{t.preview}</p>
                  <p className="mt-2 text-xs text-[color:var(--muted)]">{t.author} · {t.authorRole}</p>
                </div>
                <div className="text-right shrink-0 text-xs text-[color:var(--muted)]">
                  <div className="font-medium text-[color:var(--foreground)] text-base">{t.replies}</div>
                  <div>respostas</div>
                  <div className="mt-2">{t.views} views</div>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-lg border border-dashed border-[color:var(--border)] p-5 text-center">
        <p className="text-sm text-[color:var(--foreground)]">Tens um tema para discutir?</p>
        <button className={btnPrimary + " mt-3"}>Abrir tópico novo</button>
      </div>

      <div className="mt-12 rounded-lg border border-dashed border-[color:var(--border)] p-4 text-xs text-[color:var(--muted)]">
        Forums sintéticos para demonstração. Luma pode sugerir tópicos relevantes para cada perfil.
      </div>
    </div>
  );
}

function ThreadView({ thread, onBack }: { thread: MockThread; onBack: () => void }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <button onClick={onBack} className="text-xs text-[color:var(--primary)] hover:underline">← Voltar aos tópicos</button>
      <h1 className="mt-4 font-serif text-3xl text-[color:var(--foreground)]">{thread.title}</h1>
      <p className="mt-1 text-xs text-[color:var(--muted)]">{thread.forum} · {thread.author} · {thread.replies} respostas</p>
      <div className="mt-6 rounded-lg border border-[color:var(--border)] bg-white p-5">
        <p className="text-sm text-[color:var(--foreground)] whitespace-pre-wrap">{thread.preview}{"\n\n"}(O resto do tópico, mais {thread.replies} respostas, será sincronizado quando o forum estiver activado em produção.)</p>
      </div>
      <div className="mt-6 rounded-lg border border-dashed border-[color:var(--border)] p-4">
        <textarea className={input + " min-h-[100px]"} placeholder="Adicionar resposta..." />
        <button className={btnPrimary + " mt-3"}>Responder</button>
      </div>
    </div>
  );
}

function chip(active: boolean) {
  return `text-xs rounded-full px-3 py-1.5 border transition ${active ? "bg-[color:var(--primary)] text-white border-[color:var(--primary)]" : "bg-white text-[color:var(--foreground)] border-[color:var(--border)] hover:border-[color:var(--primary)]"}`;
}

const input = "w-full rounded-lg border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-[color:var(--foreground)] focus:outline-none focus:border-[color:var(--primary)] transition";
const btnPrimary = "inline-flex items-center rounded-full bg-[color:var(--primary)] px-4 py-2 text-xs font-medium text-white hover:bg-[color:var(--primary-700)] transition";
