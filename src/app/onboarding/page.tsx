"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getProfile, upsertProfile, type Profile } from "@/lib/profile";

const PROGRAMMES = [
  "Bachelor",
  "Master",
  "MBA / Lisbon MBA",
  "PhD",
  "Postgraduate",
  "Executive Master",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1978 + 1 }, (_, i) => CURRENT_YEAR - i);

type EduRich = { school: string | null; degree: string | null; field: string | null; start: number | null; end: number | null; description: string | null; logo: unknown };
type ExpRich = { company: string | null; role: string | null; location: string | null; start: number | null; end: number | null; current: boolean; description: string | null; logo: unknown };
type Rich = {
  about?: string | null;
  educations: EduRich[];
  experiences: ExpRich[];
  skills: { name: string | null; endorsements?: number | null }[];
  languages: { name: string | null; proficiency?: string | null }[];
  certifications: { name: string | null; issuer: string | null; year: number | null }[];
  honors?: { title: string | null; issuer: string | null; year: number | null }[];
};

export default function OnboardingPage() {
  const { ready, configured, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Profile>>({});
  const [rich, setRich] = useState<Rich | null>(null);
  const [step, setStep] = useState<"detecting" | "form">("detecting");

  useEffect(() => {
    if (!ready) return;
    if (!configured) { setLoading(false); return; }
    if (!user) { router.replace("/signin?next=/onboarding"); return; }
    (async () => {
      const p = await getProfile(user.id);
      const meta = (user.user_metadata || {}) as Record<string, unknown>;
      setForm({
        full_name: p?.full_name || (meta.full_name as string) || (meta.name as string) || "",
        headline: p?.headline || (meta.headline as string) || "",
        avatar_url: p?.avatar_url || (meta.avatar_url as string) || (meta.picture as string) || "",
        programme: p?.programme || "",
        grad_year: p?.grad_year || undefined,
        current_company: p?.current_company || "",
        current_role: p?.current_role || "",
        city: p?.city || "",
        country: p?.country || "",
        linkedin_url: p?.linkedin_url || "",
        offering: p?.offering || "",
        seeking: p?.seeking || "",
      });
      // If profile already exists with linkedin_url, skip detection and go straight to form
      if (p?.linkedin_url) setStep("form");
      setLoading(false);
    })();
  }, [ready, configured, user, router]);

  const BASE_URL = (process.env.NEXT_PUBLIC_AGENT_CHAT_URL || "").replace(/\/chat$/, "");
  const ENRICH_URL = `${BASE_URL}/enrich-profile`;
  const FIND_URL = `${BASE_URL}/find-linkedin-by-name`;
  const [enriching, setEnriching] = useState(false);
  const [enrichMsg, setEnrichMsg] = useState<string | null>(null);

  type Candidate = { linkedinUrl: string; fullName: string; title: string | null; company: string | null; location: string | null; summary: string | null };
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [manualName, setManualName] = useState("");

  useEffect(() => {
    if (loading || !user) return;
    if (step !== "detecting") return;
    if (candidates !== null) return;
    const name = form.full_name?.trim();
    if (!name) return;
    setSearching(true);
    fetch(FIND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: name }),
    })
      .then((r) => r.json())
      .then((j) => setCandidates(Array.isArray(j.candidates) ? j.candidates : []))
      .catch(() => setCandidates([]))
      .finally(() => setSearching(false));
  }, [loading, user, form.full_name, candidates, FIND_URL, step]);

  async function searchByName(name: string) {
    if (!name.trim()) return;
    setSearching(true);
    setCandidates(null);
    try {
      const r = await fetch(FIND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: name.trim() }),
      });
      const j = await r.json();
      setCandidates(Array.isArray(j.candidates) ? j.candidates : []);
    } catch {
      setCandidates([]);
    } finally {
      setSearching(false);
    }
  }

  async function pickCandidate(linkedinUrl: string) {
    if (!user) return;
    setCandidates(null);
    set("linkedin_url", linkedinUrl);
    setEnriching(true);
    setEnrichMsg(null);
    try {
      const res = await fetch(ENRICH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, linkedinUrl }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Falha a ler o LinkedIn");
      const f = j.fields || {};
      if (j.rich) setRich(j.rich as Rich);
      setForm((prev) => ({
        ...prev,
        full_name: f.full_name || prev.full_name || "",
        headline: f.headline || prev.headline || "",
        avatar_url: f.avatar_url || prev.avatar_url || "",
        current_company: f.current_company || prev.current_company || "",
        current_role: f.current_role || prev.current_role || "",
        city: f.city || prev.city || "",
        country: f.country || prev.country || "",
        programme: f.programme || prev.programme || "",
        grad_year: f.grad_year || prev.grad_year || undefined,
        offering: f.offering || prev.offering || "",
        linkedin_url: linkedinUrl,
      }));
      setEnrichMsg(j.novaMatch
        ? `✓ Encontrei o teu registo na Nova SBE (${j.novaSchool}). Confirma e guarda.`
        : "Preenchi o que consegui. Confirma o programme/year manualmente.");
      setStep("form");
    } catch (e) {
      setEnrichMsg(e instanceof Error ? e.message : "Erro a ler LinkedIn");
    } finally {
      setEnriching(false);
    }
  }

  async function onAutoFill() {
    if (!user) return;
    const url = (form.linkedin_url || "").trim();
    if (!/linkedin\.com\/in\//i.test(url)) {
      setEnrichMsg("Cola primeiro a URL do teu LinkedIn (linkedin.com/in/…)");
      return;
    }
    setEnriching(true);
    setEnrichMsg(null);
    try {
      const res = await fetch(ENRICH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, linkedinUrl: url }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Falha a ler o LinkedIn");
      const f = j.fields || {};
      if (j.rich) setRich(j.rich as Rich);
      setForm((prev) => ({
        ...prev,
        full_name: f.full_name || prev.full_name || "",
        headline: f.headline || prev.headline || "",
        avatar_url: f.avatar_url || prev.avatar_url || "",
        current_company: f.current_company || prev.current_company || "",
        current_role: f.current_role || prev.current_role || "",
        city: f.city || prev.city || "",
        country: f.country || prev.country || "",
        programme: f.programme || prev.programme || "",
        grad_year: f.grad_year || prev.grad_year || undefined,
        offering: f.offering || prev.offering || "",
      }));
      setEnrichMsg(j.novaMatch
        ? `✓ Encontrei o teu registo na Nova SBE (${j.novaSchool}). Confirma os campos e guarda.`
        : "Preenchi o que consegui. Não vi Nova SBE no teu LinkedIn — confirma o programme/year manualmente.");
    } catch (e) {
      setEnrichMsg(e instanceof Error ? e.message : "Erro a ler LinkedIn");
    } finally {
      setEnriching(false);
    }
  }

  function set<K extends keyof Profile>(k: K, v: Profile[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setErr(null);
    try {
      await upsertProfile({ id: user.id, ...form });
      router.replace("/dashboard");
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Could not save your profile.");
      setSaving(false);
    }
  }

  if (!ready || loading) return <div className="mx-auto max-w-2xl px-6 py-20 text-[color:var(--muted)]">Loading…</div>;
  if (!configured) return <div className="mx-auto max-w-2xl px-6 py-20">Sign-in is not configured. See SETUP_AUTH.md.</div>;

  // STEP 1: Detection — only show LinkedIn picker, no form
  if (step === "detecting") {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-12">
        <h1 className="font-serif text-4xl text-[color:var(--foreground)]">Vamos buscar o teu perfil</h1>
        <p className="mt-3 text-[color:var(--muted)]">
          Carrega no teu LinkedIn e nós preenchemos o resto: educação, carreira, skills, tudo.
        </p>

        <div className="mt-8 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
          {searching && (
            <p className="text-sm text-[color:var(--muted)]">A procurar “{form.full_name || manualName}” no LinkedIn…</p>
          )}

          {!searching && candidates === null && !form.full_name && (
            <div>
              <p className="text-sm font-medium text-[color:var(--foreground)]">Como é o teu nome no LinkedIn?</p>
              <div className="mt-3 flex gap-2">
                <input
                  className={input}
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Tomás Batalha"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); searchByName(manualName); } }}
                />
                <button type="button" onClick={() => searchByName(manualName)} className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-white text-sm font-medium hover:bg-[color:var(--primary-700)] transition">
                  Procurar
                </button>
              </div>
            </div>
          )}

          {!searching && candidates && candidates.length > 0 && (
            <>
              <p className="text-sm font-medium text-[color:var(--foreground)]">Qual destes és tu?</p>
              <p className="mt-1 text-xs text-[color:var(--muted)]">Encontrei {candidates.length} perfis. Carrega no teu para preencher tudo.</p>
              <div className="mt-4 space-y-2">
                {candidates.map((c) => (
                  <button
                    key={c.linkedinUrl}
                    type="button"
                    onClick={() => pickCandidate(c.linkedinUrl)}
                    disabled={enriching}
                    className="block w-full text-left rounded-xl border border-[color:var(--border)] bg-white px-4 py-3 hover:border-[color:var(--primary)] transition disabled:opacity-50"
                  >
                    <div className="text-sm font-medium text-[color:var(--foreground)]">{c.fullName}</div>
                    <div className="text-xs text-[color:var(--muted)] mt-0.5">
                      {[c.title, c.company].filter(Boolean).join(" @ ")}{c.location ? ` · ${c.location}` : ""}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => { setCandidates(null); setManualName(""); }} className="text-xs text-[color:var(--muted)] hover:text-[color:var(--primary)]">
                  Nenhum destes. Procurar outro nome.
                </button>
                <span className="text-xs text-[color:var(--muted)]">·</span>
                <button type="button" onClick={() => setStep("form")} className="text-xs text-[color:var(--muted)] hover:text-[color:var(--primary)]">
                  Saltar. Preencho manualmente.
                </button>
              </div>
            </>
          )}

          {!searching && candidates && candidates.length === 0 && (
            <div>
              <p className="text-sm text-[color:var(--foreground)]">Não encontrei ninguém com esse nome.</p>
              <div className="mt-3 flex gap-2">
                <input className={input} value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder="Tenta outro nome" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); searchByName(manualName); } }} />
                <button type="button" onClick={() => searchByName(manualName)} className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-white text-sm font-medium hover:bg-[color:var(--primary-700)] transition">
                  Procurar
                </button>
              </div>
              <button type="button" onClick={() => setStep("form")} className="mt-3 text-xs text-[color:var(--muted)] hover:text-[color:var(--primary)]">
                Saltar e preencher manualmente
              </button>
            </div>
          )}

          {enriching && (
            <div className="mt-4 text-sm text-[color:var(--muted)]">A ler o teu perfil LinkedIn… isto demora ~20 segundos.</div>
          )}
          {enrichMsg && !enriching && (
            <div className="mt-4 text-sm text-red-600">{enrichMsg}</div>
          )}
        </div>
      </div>
    );
  }

  // STEP 2: Form (with rich preview if available)
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="font-serif text-4xl text-[color:var(--foreground)]">Confirma os teus dados</h1>
      <p className="mt-3 text-[color:var(--muted)]">
        Verifica que está tudo certo. Podes editar mais tarde.
      </p>

      {enrichMsg && (
        <div className="mt-4 rounded-lg bg-[color:var(--card)] border border-[color:var(--border)] px-4 py-3 text-sm text-[color:var(--foreground)]">{enrichMsg}</div>
      )}

      {rich && <RichPreview rich={rich} />}

      <form onSubmit={onSubmit} className="mt-10 space-y-6">
        <Field label="Full name" required>
          <input className={input} value={form.full_name ?? ""} onChange={(e) => set("full_name", e.target.value)} required />
        </Field>

        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Programme" required>
            <select className={input} value={form.programme ?? ""} onChange={(e) => set("programme", e.target.value)} required>
              <option value="">Choose…</option>
              {PROGRAMMES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Graduation year" required>
            <select className={input} value={form.grad_year ?? ""} onChange={(e) => set("grad_year", Number(e.target.value) || null)} required>
              <option value="">Choose…</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Current role">
            <input className={input} value={form.current_role ?? ""} onChange={(e) => set("current_role", e.target.value)} placeholder="VP Product" />
          </Field>
          <Field label="Current company">
            <input className={input} value={form.current_company ?? ""} onChange={(e) => set("current_company", e.target.value)} placeholder="Acme Inc." />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="City" required>
            <input className={input} value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} placeholder="New York" required />
          </Field>
          <Field label="Country">
            <input className={input} value={form.country ?? ""} onChange={(e) => set("country", e.target.value)} placeholder="USA" />
          </Field>
        </div>

        <Field label="LinkedIn URL">
          <input className={input} type="url" value={form.linkedin_url ?? ""} onChange={(e) => set("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/…" />
          <button
            type="button"
            onClick={onAutoFill}
            disabled={enriching || !form.linkedin_url}
            className="mt-2 inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-xs font-medium text-[color:var(--foreground)] hover:bg-[color:var(--card)] transition disabled:opacity-50"
          >
            {enriching ? "A ler o teu LinkedIn…" : "✨ Refazer auto-fill"}
          </button>
        </Field>

        <Field label="What can you offer?">
          <textarea className={`${input} min-h-[80px]`} value={form.offering ?? ""} onChange={(e) => set("offering", e.target.value)} placeholder="Intros to NY VCs, advice on B2B SaaS pricing, a couch in Brooklyn…" />
        </Field>

        <Field label="What are you looking for?">
          <textarea className={`${input} min-h-[80px]`} value={form.seeking ?? ""} onChange={(e) => set("seeking", e.target.value)} placeholder="Co-founder, first NY hires, tickets to the next mixer…" />
        </Field>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <button type="submit" disabled={saving} className="inline-flex items-center justify-center rounded-full bg-[color:var(--primary)] px-6 py-3 text-white text-sm font-medium hover:bg-[color:var(--primary-700)] transition disabled:opacity-50">
          {saving ? "Saving…" : "Save and continue"}
        </button>
      </form>
    </div>
  );
}

function RichPreview({ rich }: { rich: Rich }) {
  const fmt = (s: number | null, e: number | null) => {
    if (!s && !e) return "";
    if (s && e) return `${s} – ${e}`;
    if (s) return `${s} – presente`;
    return `${e}`;
  };
  return (
    <div className="mt-6 space-y-5">
      {rich.about && (
        <Section title="Sobre">
          <p className="text-sm text-[color:var(--foreground)] whitespace-pre-line">{rich.about.slice(0, 600)}{rich.about.length > 600 ? "…" : ""}</p>
        </Section>
      )}
      {rich.experiences.length > 0 && (
        <Section title={`Experiência (${rich.experiences.length})`}>
          <ul className="space-y-3">
            {rich.experiences.map((x, i) => (
              <li key={i} className="text-sm">
                <div className="font-medium text-[color:var(--foreground)]">{x.role}</div>
                <div className="text-[color:var(--muted)]">{[x.company, x.location].filter(Boolean).join(" · ")}</div>
                <div className="text-xs text-[color:var(--muted)] mt-0.5">{fmt(x.start, x.end)}</div>
              </li>
            ))}
          </ul>
        </Section>
      )}
      {rich.educations.length > 0 && (
        <Section title={`Educação (${rich.educations.length})`}>
          <ul className="space-y-3">
            {rich.educations.map((e, i) => (
              <li key={i} className="text-sm">
                <div className="font-medium text-[color:var(--foreground)]">{e.school}</div>
                <div className="text-[color:var(--muted)]">{[e.degree, e.field].filter(Boolean).join(" · ")}</div>
                <div className="text-xs text-[color:var(--muted)] mt-0.5">{fmt(e.start, e.end)}</div>
              </li>
            ))}
          </ul>
        </Section>
      )}
      {rich.skills.length > 0 && (
        <Section title={`Skills (${rich.skills.length})`}>
          <div className="flex flex-wrap gap-1.5">
            {rich.skills.slice(0, 30).map((s, i) => (
              <span key={i} className="rounded-full bg-[color:var(--card)] border border-[color:var(--border)] px-2.5 py-1 text-xs text-[color:var(--foreground)]">{s.name}</span>
            ))}
          </div>
        </Section>
      )}
      {rich.languages.length > 0 && (
        <Section title="Línguas">
          <ul className="space-y-1 text-sm">
            {rich.languages.map((l, i) => (
              <li key={i} className="text-[color:var(--foreground)]">{l.name}{l.proficiency ? ` — ${l.proficiency}` : ""}</li>
            ))}
          </ul>
        </Section>
      )}
      {rich.certifications.length > 0 && (
        <Section title={`Certificações (${rich.certifications.length})`}>
          <ul className="space-y-1 text-sm">
            {rich.certifications.map((c, i) => (
              <li key={i} className="text-[color:var(--foreground)]">{c.name}{c.issuer ? ` — ${c.issuer}` : ""}{c.year ? ` (${c.year})` : ""}</li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5">
      <h3 className="text-xs uppercase tracking-widest text-[color:var(--primary)] mb-3">{title}</h3>
      {children}
    </div>
  );
}

const input = "w-full rounded-lg border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-[color:var(--foreground)] focus:outline-none focus:border-[color:var(--primary)] transition";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-widest text-[color:var(--muted)] mb-1.5">
        {label}{required && <span className="text-[color:var(--primary)]"> *</span>}
      </span>
      {children}
    </label>
  );
}
