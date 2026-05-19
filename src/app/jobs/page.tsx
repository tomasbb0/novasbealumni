"use client";

import { useState } from "react";
import { mockJobs, type MockJob } from "@/lib/mock";

export default function JobsPage() {
  const [type, setType] = useState<string>("");
  const [remote, setRemote] = useState<string>("");
  const [selected, setSelected] = useState<MockJob | null>(null);

  const filtered = mockJobs.filter((j) => {
    if (type && j.type !== type) return false;
    if (remote && j.remote !== remote) return false;
    return true;
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      <header>
        <p className="text-xs uppercase tracking-widest text-[color:var(--primary)]">Jobs</p>
        <h1 className="mt-2 font-serif text-4xl text-[color:var(--foreground)]">Oportunidades de alumni para alumni</h1>
        <p className="mt-1 text-[color:var(--muted)]">{filtered.length} vagas publicadas por alumni Nova SBE</p>
      </header>

      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        <select className={input} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Todos os contratos</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="internship">Estágio</option>
          <option value="contract">Freelance</option>
        </select>
        <select className={input} value={remote} onChange={(e) => setRemote(e.target.value)}>
          <option value="">Qualquer formato</option>
          <option value="remote">Remoto</option>
          <option value="hybrid">Híbrido</option>
          <option value="onsite">Presencial</option>
        </select>
      </div>

      <div className="mt-8 grid lg:grid-cols-[1fr_400px] gap-8">
        <ul className="space-y-2">
          {filtered.map((j) => (
            <li key={j.id}>
              <button onClick={() => setSelected(j)} className={`w-full text-left rounded-lg border p-4 transition ${selected?.id === j.id ? "border-[color:var(--primary)] bg-[color:var(--primary-50)]" : "border-[color:var(--border)] bg-white hover:border-[color:var(--primary)]"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-[color:var(--foreground)] truncate">{j.title}</div>
                    <div className="text-sm text-[color:var(--muted)] truncate">{j.company} · {j.city}</div>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-[color:var(--primary)] shrink-0">{remoteLabel(j.remote)}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {j.tags.map((t) => <span key={t} className="text-[10px] rounded-full bg-[color:var(--primary-50)] text-[color:var(--primary)] px-2 py-0.5">{t}</span>)}
                </div>
                <p className="mt-2 text-xs text-[color:var(--muted)]">{j.applicants} candidaturas · Posted {daysAgo(j.postedAt)} dias atrás</p>
              </button>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-20 self-start">
          {selected ? <JobPanel j={selected} /> : (
            <div className="rounded-lg border border-dashed border-[color:var(--border)] p-6 text-sm text-[color:var(--muted)]">
              Escolhe uma vaga à esquerda para ver os detalhes.
            </div>
          )}
        </aside>
      </div>

      <div className="mt-12 rounded-lg border border-dashed border-[color:var(--border)] p-4 text-xs text-[color:var(--muted)]">
        Vagas sintéticas para demonstração. No piloto, alumni publicam vagas próprias e do Career Office.
      </div>
    </div>
  );
}

function JobPanel({ j }: { j: MockJob }) {
  const [applied, setApplied] = useState(false);
  return (
    <div className="rounded-lg border border-[color:var(--border)] bg-white p-6">
      <h2 className="font-serif text-xl text-[color:var(--foreground)]">{j.title}</h2>
      <p className="mt-1 text-sm text-[color:var(--muted)]">{j.company} · {j.city}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-widest text-[color:var(--primary)]">
        <span className="rounded-full border border-[color:var(--primary)] px-2 py-0.5">{j.type}</span>
        <span className="rounded-full border border-[color:var(--primary)] px-2 py-0.5">{remoteLabel(j.remote)}</span>
      </div>
      <p className="mt-4 text-sm text-[color:var(--foreground)]">{j.description}</p>
      <dl className="mt-4 text-xs text-[color:var(--muted)] space-y-2">
        <div><dt className="uppercase tracking-widest">Publicado por</dt><dd className="text-[color:var(--foreground)]">{j.postedBy}</dd></div>
        <div><dt className="uppercase tracking-widest">Candidaturas</dt><dd className="text-[color:var(--foreground)]">{j.applicants}</dd></div>
      </dl>
      {applied ? (
        <div className="mt-5 rounded-md bg-[color:var(--primary-50)] p-3 text-xs text-[color:var(--primary)]">
          Candidatura enviada com o teu perfil Nova SBE Alumni Club. Receberás resposta directamente do publisher.
        </div>
      ) : (
        <button onClick={() => setApplied(true)} className={btnPrimary + " mt-5 w-full justify-center"}>Candidatar-me com perfil alumni</button>
      )}
    </div>
  );
}

function remoteLabel(r: string) {
  return ({ remote: "Remoto", hybrid: "Híbrido", onsite: "Presencial" } as Record<string, string>)[r] || r;
}

function daysAgo(iso: string) {
  const d = new Date(iso).getTime();
  return Math.max(1, Math.round((Date.now() - d) / 86400000));
}

const input = "w-full rounded-lg border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-[color:var(--foreground)] focus:outline-none focus:border-[color:var(--primary)] transition";
const btnPrimary = "inline-flex items-center rounded-full bg-[color:var(--primary)] px-4 py-2 text-xs font-medium text-white hover:bg-[color:var(--primary-700)] transition";
