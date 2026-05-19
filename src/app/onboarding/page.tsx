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

export default function OnboardingPage() {
  const { ready, configured, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Profile>>({});

  useEffect(() => {
    if (!ready) return;
    if (!configured) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
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

  useEffect(() => {
    if (loading || !user) return;
    if (form.linkedin_url || candidates !== null) return;
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
  }, [loading, user, form.linkedin_url, form.full_name, candidates, FIND_URL]);

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
      setForm((prev) => ({
        ...prev,
        full_name: prev.full_name || f.full_name || "",
        headline: prev.headline || f.headline || "",
        avatar_url: prev.avatar_url || f.avatar_url || "",
        current_company: prev.current_company || f.current_company || "",
        current_role: prev.current_role || f.current_role || "",
        city: prev.city || f.city || "",
        country: prev.country || f.country || "",
        programme: prev.programme || f.programme || "",
        grad_year: prev.grad_year || f.grad_year || undefined,
        offering: prev.offering || f.offering || "",
        linkedin_url: linkedinUrl,
      }));
      setEnrichMsg(j.novaMatch
        ? `✓ Encontrei o teu registo na Nova SBE (${j.novaSchool}). Confirma e guarda.`
        : "Preenchi o que consegui. Confirma o programme/year manualmente.");
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
      setForm((prev) => ({
        ...prev,
        full_name: prev.full_name || f.full_name || "",
        headline: prev.headline || f.headline || "",
        avatar_url: prev.avatar_url || f.avatar_url || "",
        current_company: prev.current_company || f.current_company || "",
        current_role: prev.current_role || f.current_role || "",
        city: prev.city || f.city || "",
        country: prev.country || f.country || "",
        programme: prev.programme || f.programme || "",
        grad_year: prev.grad_year || f.grad_year || undefined,
        offering: prev.offering || f.offering || "",
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

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="font-serif text-4xl text-[color:var(--foreground)]">One last step</h1>
      <p className="mt-3 text-[color:var(--muted)]">
        Confirm a few details so other alumni can find you. You can edit any of this later.
      </p>

      {(searching || (candidates && candidates.length > 0)) && !form.linkedin_url && (
        <div className="mt-8 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
          {searching ? (
            <p className="text-sm text-[color:var(--muted)]">A procurar o teu perfil no LinkedIn…</p>
          ) : (
            <>
              <p className="text-sm font-medium text-[color:var(--foreground)]">Qual destes és tu?</p>
              <p className="mt-1 text-xs text-[color:var(--muted)]">Encontrei {candidates!.length} perfis. Carrega no teu para preencher tudo automaticamente.</p>
              <div className="mt-4 space-y-2">
                {candidates!.map((c) => (
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
                <button
                  type="button"
                  onClick={() => setCandidates([])}
                  className="block w-full text-left rounded-xl border border-dashed border-[color:var(--border)] px-4 py-3 text-xs text-[color:var(--muted)] hover:border-[color:var(--primary)] transition"
                >
                  Nenhum destes. Preencho manualmente.
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {enriching && (
        <div className="mt-4 text-sm text-[color:var(--muted)]">A ler o teu perfil LinkedIn…</div>
      )}
      {enrichMsg && !enriching && (
        <div className="mt-4 text-sm text-[color:var(--foreground)]">{enrichMsg}</div>
      )}

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
            {enriching ? "A ler o teu LinkedIn…" : "✨ Auto-fill from LinkedIn"}
          </button>
          {enrichMsg && <p className="mt-2 text-xs text-[color:var(--muted)]">{enrichMsg}</p>}
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
