"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import type { Profile } from "@/lib/profile";
import { listMyConnections, sendConnectionRequest, respondToConnection, statusBetween, type Connection } from "@/lib/connectRequests";

export default function DirectoryPage() {
  const { ready, configured, user } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [conns, setConns] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [programme, setProgramme] = useState("");
  const [selected, setSelected] = useState<Profile | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!configured) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    if (!user) { router.replace("/signin?next=/directory"); return; }
    (async () => {
      const { getSupabase } = await import("@/lib/supabase");
      const sb = getSupabase();
      const { data } = await sb.from("profiles").select("*").order("updated_at", { ascending: false }).limit(500);
      setProfiles((data as Profile[]) || []);
      try { setConns(await listMyConnections()); } catch { /* RLS or schema not yet applied */ }
      setLoading(false);
    })();
  }, [ready, configured, user, router]);

  const cities = useMemo(() => Array.from(new Set(profiles.map((p) => p.city).filter(Boolean) as string[])).sort(), [profiles]);
  const programmes = useMemo(() => Array.from(new Set(profiles.map((p) => p.programme).filter(Boolean) as string[])).sort(), [profiles]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return profiles.filter((p) => {
      if (city && p.city !== city) return false;
      if (programme && p.programme !== programme) return false;
      if (!needle) return true;
      const hay = [p.full_name, p.headline, p.current_role, p.current_company, p.city, p.programme, p.offering, p.seeking].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(needle);
    });
  }, [profiles, q, city, programme]);

  if (!ready || loading) return <div className="mx-auto w-full max-w-5xl px-6 py-16 text-[color:var(--muted)]">Loading directory…</div>;
  if (!configured) return <div className="mx-auto w-full max-w-2xl px-6 py-20">Sign-in is not configured. See SETUP_AUTH.md.</div>;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <header>
        <p className="text-xs uppercase tracking-widest text-[color:var(--primary)]">Directory</p>
        <h1 className="mt-2 font-serif text-4xl text-[color:var(--foreground)]">Alumni</h1>
        <p className="mt-1 text-[color:var(--muted)]">{filtered.length} of {profiles.length} alumni</p>
      </header>

      <div className="mt-6 grid sm:grid-cols-3 gap-3">
        <input className={input} placeholder="Search name, role, company…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={input} value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">All cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className={input} value={programme} onChange={(e) => setProgramme(e.target.value)}>
          <option value="">All programmes</option>
          {programmes.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="mt-8 grid lg:grid-cols-[1fr_360px] gap-8">
        <ul className="space-y-2">
          {filtered.map((p) => (
            <li key={p.id}>
              <button onClick={() => setSelected(p)} className={`w-full text-left flex items-center gap-3 rounded-lg border p-3 transition ${selected?.id === p.id ? "border-[color:var(--primary)] bg-[color:var(--primary-50)]" : "border-[color:var(--border)] bg-white hover:border-[color:var(--primary)]"}`}>
                <Avatar name={p.full_name} src={p.avatar_url} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[color:var(--foreground)] truncate">{p.full_name || "Alumnus"}</div>
                  <div className="text-xs text-[color:var(--muted)] truncate">{[p.current_role, p.current_company].filter(Boolean).join(" @ ")}</div>
                  <div className="text-xs text-[color:var(--muted)] truncate">{[p.programme, p.grad_year, p.city].filter(Boolean).join(" · ")}</div>
                </div>
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="text-sm text-[color:var(--muted)] italic">No alumni match those filters yet.</li>
          )}
        </ul>

        <aside className="lg:sticky lg:top-20 self-start">
          {selected ? <ProfilePanel p={selected} myId={user?.id} conns={conns} onChange={async () => { try { setConns(await listMyConnections()); } catch {} }} /> : (
            <div className="rounded-lg border border-dashed border-[color:var(--border)] p-6 text-sm text-[color:var(--muted)]">
              Pick someone on the left to see their full profile.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function ProfilePanel({ p, myId, conns, onChange }: { p: Profile; myId?: string; conns: Connection[]; onChange: () => void | Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const isMe = myId && p.id === myId;
  const rel = myId ? statusBetween(myId, p.id, conns) : { state: "none" as const };

  async function send() {
    setBusy(true); setErr(null);
    try { await sendConnectionRequest(p.id); await onChange(); } catch (e) { setErr(e instanceof Error ? e.message : "Could not send request"); }
    finally { setBusy(false); }
  }
  async function respond(status: "accepted" | "declined") {
    if (!rel.id) return;
    setBusy(true); setErr(null);
    try { await respondToConnection(rel.id, status); await onChange(); } catch (e) { setErr(e instanceof Error ? e.message : "Could not update"); }
    finally { setBusy(false); }
  }

  return (
    <div className="rounded-lg border border-[color:var(--border)] bg-white p-6">
      <div className="flex items-center gap-3">
        <Avatar name={p.full_name} src={p.avatar_url} size={56} />
        <div className="min-w-0">
          <div className="font-serif text-xl text-[color:var(--foreground)] truncate">{p.full_name || "Alumnus"}</div>
          <div className="text-xs text-[color:var(--muted)] truncate">{p.headline || [p.current_role, p.current_company].filter(Boolean).join(" @ ")}</div>
        </div>
      </div>
      <dl className="mt-5 space-y-3 text-sm">
        <Row label="Programme" value={[p.programme, p.grad_year].filter(Boolean).join(" · ")} />
        <Row label="Where" value={[p.city, p.country].filter(Boolean).join(", ")} />
        <Row label="Offering" value={p.offering} multiline />
        <Row label="Looking for" value={p.seeking} multiline />
      </dl>

      {!isMe && (
        <div className="mt-5 flex items-center gap-2 flex-wrap">
          {rel.state === "none" && (
            <button onClick={send} disabled={busy} className={btnPrimary}>{busy ? "Sending…" : "Connect"}</button>
          )}
          {rel.state === "outgoing-pending" && (
            <span className="text-xs text-[color:var(--muted)]">Request sent. Waiting for reply.</span>
          )}
          {rel.state === "incoming-pending" && (
            <>
              <button onClick={() => respond("accepted")} disabled={busy} className={btnPrimary}>Accept</button>
              <button onClick={() => respond("declined")} disabled={busy} className={btnGhost}>Decline</button>
            </>
          )}
          {rel.state === "accepted" && <span className="text-xs text-[color:var(--primary)] font-medium">Connected ✓</span>}
          {rel.state === "declined" && <span className="text-xs text-[color:var(--muted)]">Request declined.</span>}

          {p.linkedin_url && (
            <a href={p.linkedin_url} target="_blank" rel="noreferrer" className={btnGhost}>LinkedIn →</a>
          )}
        </div>
      )}
      {err && <p className="mt-3 text-xs text-red-600">{err}</p>}
    </div>
  );
}

const btnPrimary = "inline-flex items-center rounded-full bg-[color:var(--primary)] px-4 py-2 text-xs font-medium text-white hover:bg-[color:var(--primary-700)] transition disabled:opacity-50";
const btnGhost = "inline-flex items-center rounded-full border border-[color:var(--border)] px-4 py-2 text-xs font-medium text-[color:var(--foreground)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] transition";

function Row({ label, value, multiline }: { label: string; value?: string | number | null; multiline?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-widest text-[color:var(--muted)]">{label}</dt>
      <dd className={`mt-0.5 text-[color:var(--foreground)] ${multiline ? "whitespace-pre-wrap" : ""}`}>{value}</dd>
    </div>
  );
}

function Avatar({ name, src, size = 40 }: { name?: string | null; src?: string | null; size?: number }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className="rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <div className="rounded-full bg-[color:var(--primary-50)] flex items-center justify-center text-[color:var(--primary)] font-medium" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {(name || "?").slice(0, 1)}
    </div>
  );
}

const input = "w-full rounded-lg border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-[color:var(--foreground)] focus:outline-none focus:border-[color:var(--primary)] transition";
