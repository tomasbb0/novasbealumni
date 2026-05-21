"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getProfile, upsertProfile, type Profile, type RichProfile } from "@/lib/profile";

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

type EduRich = RichProfile["educations"][number];
type ExpRich = RichProfile["experiences"][number];
type Rich = RichProfile;

export default function OnboardingPage() {
  const { ready, configured, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Profile>>({});
  const [rich, setRich] = useState<Rich | null>(null);
  const [richLoading, setRichLoading] = useState(false);
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
      if (p?.linkedin_url) {
        setStep("form");
        // If we already have a saved rich_profile, use it; otherwise fetch fresh + persist silently
        if (p.rich_profile && (p.rich_profile.experiences?.length || p.rich_profile.educations?.length)) {
          setRich(p.rich_profile as Rich);
        } else {
          setRichLoading(true);
          fetch(`${(process.env.NEXT_PUBLIC_AGENT_CHAT_URL || "").replace(/\/chat$/, "")}/enrich-profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ linkedinUrl: p.linkedin_url, dryRun: true }),
          })
            .then((r) => r.json())
            .then(async (j) => {
              if (j.rich) {
                setRich(j.rich as Rich);
                // Silently persist so we don't refetch every time
                try { await upsertProfile({ id: user.id, rich_profile: j.rich as Rich }); }
                catch { /* column may not exist yet; ignore */ }
              }
            })
            .catch(() => {})
            .finally(() => setRichLoading(false));
        }
      }
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
      if (!res.ok) throw new Error(j.error || "Failed to read LinkedIn");
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
      setEnrichMsg(e instanceof Error ? e.message : "Error reading LinkedIn");
    } finally {
      setEnriching(false);
    }
  }

  async function onAutoFill() {
    if (!user) return;
    const url = (form.linkedin_url || "").trim();
    if (!/linkedin\.com\/in\//i.test(url)) {
      setEnrichMsg("Paste your LinkedIn URL first (linkedin.com/in/…)");
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
      if (!res.ok) throw new Error(j.error || "Failed to read LinkedIn");
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
        ? `✓ Found your Nova SBE record (${j.novaSchool}). Review and save.`
        : "Filled what I could. Couldn't spot Nova SBE on your LinkedIn — set programme/year manually.");
    } catch (e) {
      setEnrichMsg(e instanceof Error ? e.message : "Error reading LinkedIn");
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
      try {
        await upsertProfile({ id: user.id, ...form, rich_profile: rich });
      } catch (saveErr) {
        // If rich_profile column doesn't exist yet, retry without it
        const msg = saveErr instanceof Error ? saveErr.message : String(saveErr);
        if (/rich_profile/i.test(msg) || /column.*not exist/i.test(msg) || /schema cache/i.test(msg)) {
          await upsertProfile({ id: user.id, ...form });
        } else {
          throw saveErr;
        }
      }
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
        <h1 className="font-serif text-4xl text-[color:var(--foreground)]">Let&apos;s fetch your profile</h1>
        <p className="mt-3 text-[color:var(--muted)]">
          Pick your LinkedIn and we fill the rest: education, career, skills, everything.
        </p>

        <div className="mt-8 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
          {searching && (
            <p className="text-sm text-[color:var(--muted)]">Searching “{form.full_name || manualName}” on LinkedIn…</p>
          )}

          {!searching && candidates === null && !form.full_name && (
            <div>
              <p className="text-sm font-medium text-[color:var(--foreground)]">What&apos;s your name on LinkedIn?</p>
              <div className="mt-3 flex gap-2">
                <input
                  className={input}
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Tomás Batalha"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); searchByName(manualName); } }}
                />
                <button type="button" onClick={() => searchByName(manualName)} className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-white text-sm font-medium hover:bg-[color:var(--primary-700)] transition">
                  Search
                </button>
              </div>
            </div>
          )}

          {!searching && candidates && candidates.length > 0 && (
            <>
              <p className="text-sm font-medium text-[color:var(--foreground)]">Which one is you?</p>
              <p className="mt-1 text-xs text-[color:var(--muted)]">Found {candidates.length} profiles. Click yours to fill everything.</p>
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
                  None of these. Search another name.
                </button>
                <span className="text-xs text-[color:var(--muted)]">·</span>
                <button type="button" onClick={() => setStep("form")} className="text-xs text-[color:var(--muted)] hover:text-[color:var(--primary)]">
                  Skip. I&apos;ll fill manually.
                </button>
              </div>
            </>
          )}

          {!searching && candidates && candidates.length === 0 && (
            <div>
              <p className="text-sm text-[color:var(--foreground)]">Couldn&apos;t find anyone with that name.</p>
              <div className="mt-3 flex gap-2">
                <input className={input} value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder="Try another name" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); searchByName(manualName); } }} />
                <button type="button" onClick={() => searchByName(manualName)} className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-white text-sm font-medium hover:bg-[color:var(--primary-700)] transition">
                  Search
                </button>
              </div>
              <button type="button" onClick={() => setStep("form")} className="mt-3 text-xs text-[color:var(--muted)] hover:text-[color:var(--primary)]">
                Skip and fill manually
              </button>
            </div>
          )}

          {enriching && (
            <div className="mt-4 text-sm text-[color:var(--muted)]">Reading your LinkedIn profile… takes ~20 seconds.</div>
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-[color:var(--foreground)]">Your Profile</h1>
          <p className="mt-3 text-[color:var(--muted)]">
            Review everything. Edit any field. Add or remove items as you like.
          </p>
        </div>
        <button
          type="button"
          onClick={onAutoFill}
          disabled={enriching || !form.linkedin_url}
          className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[color:var(--primary)] px-4 py-2 text-xs font-medium text-white hover:bg-[color:var(--primary-700)] transition disabled:opacity-50"
        >
          {enriching ? "Updating…" : "✨ Update from LinkedIn"}
        </button>
      </div>

      {enrichMsg && (
        <div className="mt-4 rounded-lg bg-[color:var(--card)] border border-[color:var(--border)] px-4 py-3 text-sm text-[color:var(--foreground)]">{enrichMsg}</div>
      )}

      {richLoading && !rich && (
        <div className="mt-6 rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3 text-sm text-[color:var(--muted)] flex items-center gap-3">
          <span className="inline-block h-3 w-3 rounded-full bg-[color:var(--primary)] animate-pulse" />
          Loading your full LinkedIn profile… (~20s)
        </div>
      )}

      {rich && <RichPreview rich={rich} setRich={setRich} />}

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

function RichPreview({ rich, setRich }: { rich: Rich; setRich: (r: Rich) => void }) {
  const fmt = (s: number | null, e: number | null) => {
    if (!s && !e) return "";
    if (s && e) return `${s} – ${e}`;
    if (s) return `${s} – present`;
    return `${e}`;
  };
  const [editingAbout, setEditingAbout] = useState(false);
  const [editingExp, setEditingExp] = useState<number | null>(null);
  const [editingEdu, setEditingEdu] = useState<number | null>(null);
  const [editingLang, setEditingLang] = useState<number | null>(null);
  const [editingCert, setEditingCert] = useState<number | null>(null);
  const [newSkill, setNewSkill] = useState("");

  const updateExp = (i: number, patch: Partial<ExpRich>) => {
    const next = rich.experiences.map((x, j) => j === i ? { ...x, ...patch } : x);
    setRich({ ...rich, experiences: next });
  };
  const updateEdu = (i: number, patch: Partial<EduRich>) => {
    const next = rich.educations.map((x, j) => j === i ? { ...x, ...patch } : x);
    setRich({ ...rich, educations: next });
  };
  const removeSkill = (i: number) => setRich({ ...rich, skills: rich.skills.filter((_, j) => j !== i) });
  const addSkill = () => {
    const n = newSkill.trim();
    if (!n) return;
    setRich({ ...rich, skills: [...rich.skills, { name: n }] });
    setNewSkill("");
  };
  const updateLang = (i: number, patch: Partial<Rich["languages"][number]>) => {
    setRich({ ...rich, languages: rich.languages.map((l, j) => j === i ? { ...l, ...patch } : l) });
  };
  const updateCert = (i: number, patch: Partial<Rich["certifications"][number]>) => {
    setRich({ ...rich, certifications: rich.certifications.map((c, j) => j === i ? { ...c, ...patch } : c) });
  };

  const numOrNull = (v: string) => v.trim() === "" ? null : Number(v);
  const editBtn = "text-xs text-[color:var(--primary)] hover:underline";

  return (
    <div className="mt-6 space-y-5">
      <Section title="About" right={!editingAbout ? <button type="button" onClick={() => setEditingAbout(true)} className={editBtn}>Edit</button> : <button type="button" onClick={() => setEditingAbout(false)} className={editBtn}>Done</button>}>
        {editingAbout ? (
          <textarea className={`${input} min-h-[140px]`} value={rich.about ?? ""} onChange={(e) => setRich({ ...rich, about: e.target.value })} />
        ) : (
          <p className="text-sm text-[color:var(--foreground)] whitespace-pre-line">{rich.about || <span className="italic text-[color:var(--muted)]">Sem descrição. Clica em editar para adicionar.</span>}</p>
        )}
      </Section>

      <Section title={`Experience (${rich.experiences.length})`}>
        <ul className="space-y-4">
          {rich.experiences.map((x, i) => (
            <li key={i} className="text-sm border-b border-[color:var(--border)] last:border-0 pb-4 last:pb-0">
              {editingExp === i ? (
                <div className="space-y-2">
                  <input className={input} placeholder="Role" value={x.role ?? ""} onChange={(e) => updateExp(i, { role: e.target.value })} />
                  <input className={input} placeholder="Company" value={x.company ?? ""} onChange={(e) => updateExp(i, { company: e.target.value })} />
                  <input className={input} placeholder="Location" value={x.location ?? ""} onChange={(e) => updateExp(i, { location: e.target.value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <input className={input} placeholder="Start year" type="number" value={x.start ?? ""} onChange={(e) => updateExp(i, { start: numOrNull(e.target.value) })} />
                    <input className={input} placeholder="End year (blank = present)" type="number" value={x.end ?? ""} onChange={(e) => updateExp(i, { end: numOrNull(e.target.value) })} />
                  </div>
                  <textarea className={`${input} min-h-[90px]`} placeholder="Description" value={x.description ?? ""} onChange={(e) => updateExp(i, { description: e.target.value })} />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => { setRich({ ...rich, experiences: rich.experiences.filter((_, j) => j !== i) }); setEditingExp(null); }} className="text-xs text-red-600 hover:underline">Delete</button>
                    <button type="button" onClick={() => setEditingExp(null)} className={editBtn}>Done</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-[color:var(--foreground)]">{x.role}</div>
                      <div className="text-[color:var(--muted)]">{[x.company, x.location].filter(Boolean).join(" · ")}</div>
                      <div className="text-xs text-[color:var(--muted)] mt-0.5">{fmt(x.start, x.end)}</div>
                    </div>
                    <button type="button" onClick={() => setEditingExp(i)} className={editBtn}>Edit</button>
                  </div>
                  {x.description && (
                    <p className="mt-2 text-xs text-[color:var(--foreground)] whitespace-pre-line opacity-80">{x.description}</p>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </Section>

      <Section title={`Education (${rich.educations.length})`}>
        <ul className="space-y-4">
          {rich.educations.map((e, i) => (
            <li key={i} className="text-sm border-b border-[color:var(--border)] last:border-0 pb-4 last:pb-0">
              {editingEdu === i ? (
                <div className="space-y-2">
                  <input className={input} placeholder="School" value={e.school ?? ""} onChange={(ev) => updateEdu(i, { school: ev.target.value })} />
                  <input className={input} placeholder="Degree" value={e.degree ?? ""} onChange={(ev) => updateEdu(i, { degree: ev.target.value })} />
                  <input className={input} placeholder="Field" value={e.field ?? ""} onChange={(ev) => updateEdu(i, { field: ev.target.value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <input className={input} placeholder="Start year" type="number" value={e.start ?? ""} onChange={(ev) => updateEdu(i, { start: numOrNull(ev.target.value) })} />
                    <input className={input} placeholder="End year" type="number" value={e.end ?? ""} onChange={(ev) => updateEdu(i, { end: numOrNull(ev.target.value) })} />
                  </div>
                  <textarea className={`${input} min-h-[80px]`} placeholder="Description" value={e.description ?? ""} onChange={(ev) => updateEdu(i, { description: ev.target.value })} />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => { setRich({ ...rich, educations: rich.educations.filter((_, j) => j !== i) }); setEditingEdu(null); }} className="text-xs text-red-600 hover:underline">Delete</button>
                    <button type="button" onClick={() => setEditingEdu(null)} className={editBtn}>Done</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-[color:var(--foreground)]">{e.school}</div>
                      <div className="text-[color:var(--muted)]">{[e.degree, e.field].filter(Boolean).join(" · ")}</div>
                      <div className="text-xs text-[color:var(--muted)] mt-0.5">{fmt(e.start, e.end)}</div>
                    </div>
                    <button type="button" onClick={() => setEditingEdu(i)} className={editBtn}>Edit</button>
                  </div>
                  {e.description && (
                    <p className="mt-2 text-xs text-[color:var(--foreground)] whitespace-pre-line opacity-80">{e.description}</p>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </Section>

      <Section title={`Skills (${rich.skills.length})`}>
        <div className="flex flex-wrap gap-1.5">
          {rich.skills.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-full bg-[color:var(--card)] border border-[color:var(--border)] px-2.5 py-1 text-xs text-[color:var(--foreground)]">
              {s.name}
              <button type="button" onClick={() => removeSkill(i)} aria-label="Remove" className="text-[color:var(--muted)] hover:text-red-600">×</button>
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input className={input} placeholder="Add skill" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} />
          <button type="button" onClick={addSkill} className="rounded-full border border-[color:var(--border)] px-4 text-xs">Add</button>
        </div>
      </Section>

      {rich.languages.length > 0 && (
        <Section title="Languages">
          <ul className="space-y-2 text-sm">
            {rich.languages.map((l, i) => (
              <li key={i}>
                {editingLang === i ? (
                  <div className="flex gap-2">
                    <input className={input} placeholder="Language" value={l.name ?? ""} onChange={(e) => updateLang(i, { name: e.target.value })} />
                    <input className={input} placeholder="Level" value={l.proficiency ?? ""} onChange={(e) => updateLang(i, { proficiency: e.target.value })} />
                    <button type="button" onClick={() => setEditingLang(null)} className={editBtn}>OK</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-[color:var(--foreground)]">{l.name}{l.proficiency ? ` — ${l.proficiency}` : ""}</span>
                    <button type="button" onClick={() => setEditingLang(i)} className={editBtn}>Edit</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {rich.certifications.length > 0 && (
        <Section title={`Certifications (${rich.certifications.length})`}>
          <ul className="space-y-2 text-sm">
            {rich.certifications.map((c, i) => (
              <li key={i}>
                {editingCert === i ? (
                  <div className="space-y-2">
                    <input className={input} placeholder="Name" value={c.name ?? ""} onChange={(e) => updateCert(i, { name: e.target.value })} />
                    <div className="grid grid-cols-2 gap-2">
                      <input className={input} placeholder="Issuer" value={c.issuer ?? ""} onChange={(e) => updateCert(i, { issuer: e.target.value })} />
                      <input className={input} placeholder="Year" type="number" value={c.year ?? ""} onChange={(e) => updateCert(i, { year: numOrNull(e.target.value) })} />
                    </div>
                    <div className="flex justify-end">
                      <button type="button" onClick={() => setEditingCert(null)} className={editBtn}>OK</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-[color:var(--foreground)]">{c.name}{c.issuer ? ` — ${c.issuer}` : ""}{c.year ? ` (${c.year})` : ""}</span>
                    <button type="button" onClick={() => setEditingCert(i)} className={editBtn}>Edit</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs uppercase tracking-widest text-[color:var(--primary)]">{title}</h3>
        {right}
      </div>
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
