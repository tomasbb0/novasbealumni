"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getSupabase, hasSupabaseConfig } from "@/lib/supabase";
import { listAllEvents, upsertEvent, deleteEvent, type AlumniEvent } from "@/lib/events";

type FormState = {
  id?: string;
  title: string;
  description: string;
  starts_at: string;
  date_label: string;
  venue_label: string;
  city: string;
  rsvp_url: string;
  is_published: boolean;
};

const empty: FormState = {
  title: "",
  description: "",
  starts_at: "",
  date_label: "",
  venue_label: "",
  city: "",
  rsvp_url: "",
  is_published: true,
};

export default function AdminEventsPage() {
  const { ready, configured, user } = useAuth();
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [events, setEvents] = useState<AlumniEvent[]>([]);
  const [form, setForm] = useState<FormState>(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!configured) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAllowed(false);
      return;
    }
    if (!user) {
      router.replace("/signin?next=/admin/events");
      return;
    }
    (async () => {
      const { data } = await getSupabase()
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();
      const ok = !!(data && (data as { is_admin?: boolean }).is_admin);
      setAllowed(ok);
      if (ok) setEvents(await listAllEvents());
    })();
  }, [ready, configured, user, router]);

  const sorted = useMemo(
    () => [...events].sort((a, b) => (a.starts_at || "").localeCompare(b.starts_at || "")),
    [events]
  );

  if (!ready || allowed === null) {
    return <div className="mx-auto w-full max-w-4xl px-6 py-16 text-[color:var(--muted)]">Loading…</div>;
  }
  if (!hasSupabaseConfig()) {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-20">
        <h1 className="font-serif text-3xl">Events admin</h1>
        <p className="mt-3 text-[color:var(--muted)]">Sign-in is not configured yet.</p>
      </div>
    );
  }
  if (!allowed) {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-20">
        <h1 className="font-serif text-3xl">Events admin</h1>
        <p className="mt-3 text-[color:var(--muted)]">
          You are signed in but not flagged as an admin. Open the Supabase Table Editor → <code>profiles</code> table → find your row → set <code>is_admin</code> to <code>true</code>.
        </p>
        <Link href="/dashboard" className="inline-block mt-4 text-sm text-[color:var(--primary)] underline">Back to dashboard</Link>
      </div>
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await upsertEvent({
        id: form.id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        date_label: form.date_label.trim() || null,
        venue_label: form.venue_label.trim() || null,
        city: form.city.trim() || null,
        rsvp_url: form.rsvp_url.trim() || null,
        is_published: form.is_published,
      });
      setForm(empty);
      setEvents(await listAllEvents());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not save event");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    setBusy(true);
    try {
      await deleteEvent(id);
      setEvents(await listAllEvents());
    } finally {
      setBusy(false);
    }
  }

  function edit(ev: AlumniEvent) {
    setForm({
      id: ev.id,
      title: ev.title,
      description: ev.description || "",
      starts_at: ev.starts_at ? toLocalInput(ev.starts_at) : "",
      date_label: ev.date_label || "",
      venue_label: ev.venue_label || "",
      city: ev.city || "",
      rsvp_url: ev.rsvp_url || "",
      is_published: ev.is_published,
    });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-[color:var(--primary)]">Admin</p>
        <h1 className="mt-2 font-serif text-4xl">Events</h1>
        <p className="mt-2 text-[color:var(--muted)] text-sm">Add or edit events. They appear on every signed-in dashboard immediately. No deploy needed.</p>
      </header>

      <form onSubmit={save} className="rounded-lg border border-[color:var(--border)] bg-white p-5 space-y-4">
        <h2 className="font-serif text-lg">{form.id ? "Edit event" : "New event"}</h2>
        {error && <div className="rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}
        <Field label="Title">
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Date & time">
            <input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Date label (optional override)">
            <input value={form.date_label} onChange={(e) => setForm({ ...form, date_label: e.target.value })} placeholder="e.g. Save the date" className={inputCls} />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Venue">
            <input value={form.venue_label} onChange={(e) => setForm({ ...form, venue_label: e.target.value })} placeholder="e.g. Nova SBE Carcavelos campus" className={inputCls} />
          </Field>
          <Field label="City">
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Lisbon" className={inputCls} />
          </Field>
        </div>
        <Field label="RSVP URL (optional)">
          <input type="url" value={form.rsvp_url} onChange={(e) => setForm({ ...form, rsvp_url: e.target.value })} placeholder="https://..." className={inputCls} />
        </Field>
        <Field label="Description (optional)">
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputCls} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
          Published (visible on dashboards)
        </label>
        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={busy} className="rounded-full bg-[color:var(--primary)] text-[color:var(--on-primary)] px-5 py-2 text-sm font-medium hover:bg-[color:var(--primary-700)] transition disabled:opacity-50">
            {busy ? "Saving…" : form.id ? "Save changes" : "Create event"}
          </button>
          {form.id && (
            <button type="button" onClick={() => setForm(empty)} className="text-sm text-[color:var(--muted)] hover:text-[color:var(--primary)]">
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <section className="mt-10">
        <h2 className="font-serif text-xl mb-3">All events ({sorted.length})</h2>
        {sorted.length === 0 ? (
          <p className="text-sm text-[color:var(--muted)] italic">No events yet. Add one above.</p>
        ) : (
          <ul className="space-y-3">
            {sorted.map((ev) => (
              <li key={ev.id} className="rounded-lg border border-[color:var(--border)] bg-white p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[color:var(--foreground)]">{ev.title}</div>
                  <div className="text-xs text-[color:var(--muted)] mt-0.5">
                    {[
                      ev.date_label || (ev.starts_at ? new Date(ev.starts_at).toLocaleString() : ""),
                      ev.venue_label,
                      ev.city,
                    ].filter(Boolean).join(" · ")}
                  </div>
                  {!ev.is_published && <div className="text-xs text-amber-700 mt-1">Hidden</div>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => edit(ev)} className="text-xs text-[color:var(--primary)] hover:underline">Edit</button>
                  <button onClick={() => remove(ev.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const inputCls = "mt-1 w-full rounded-md border border-[color:var(--border)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-[color:var(--muted)] uppercase tracking-wide">{label}</span>
      {children}
    </label>
  );
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
