import type { Metadata } from "next";
import {
  getProposedConnections,
  groupByStatus,
  OPPORTUNITY_LABELS,
  type EnrichedConnection,
} from "@/lib/connections";

export const metadata: Metadata = {
  title: "Proposed connections",
  description:
    "Live feed of high signal alumni connections proposed by the Nova SBE 24/7 networker agent.",
};

export default function ConnectionsPage() {
  const all = getProposedConnections();
  const groups = groupByStatus(all);
  const lastTick = all[0]?.generated_at;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-20">
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-3 py-1 text-xs uppercase tracking-widest text-[color:var(--primary)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--accent)] animate-pulse" />
          24/7 networker
        </div>
        <h1 className="mt-6 font-serif text-5xl text-[color:var(--foreground)]">
          Proposed connections
        </h1>
        <p className="mt-4 max-w-2xl text-[color:var(--muted)] leading-relaxed">
          Our autonomous alumni relations agent runs every six hours. It reads
          every Nova SBE NYC profile, looks for genuine synergies (jobs,
          co-founder fits, mentorship, warm intros) and drafts the intro for the
          admin to send. Quiet weeks produce nothing. That is intentional.
        </p>
        <div className="mt-6 flex flex-wrap gap-6 text-sm text-[color:var(--muted)]">
          <Stat label="Total proposed" value={all.length} />
          <Stat label="Pending" value={groups.pending.length} />
          <Stat label="Sent" value={groups.sent.length} />
          <Stat label="Successful" value={groups.successful.length} />
          {lastTick && (
            <Stat
              label="Last proposal"
              value={new Date(lastTick).toLocaleString("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            />
          )}
        </div>
      </header>

      {all.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-16">
          <Section title="Pending review" items={groups.pending} highlight />
          <Section title="Intro sent" items={groups.sent} />
          <Section title="Successful matches" items={groups.successful} />
          <Section title="Dismissed" items={groups.dismissed} muted />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-[color:var(--primary)]">
        {label}
      </div>
      <div className="mt-1 font-serif text-2xl text-[color:var(--foreground)]">
        {value}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-[color:var(--border)] bg-white p-12 text-center">
      <h2 className="font-serif text-2xl text-[color:var(--foreground)]">
        Nothing yet.
      </h2>
      <p className="mt-3 text-[color:var(--muted)] max-w-md mx-auto">
        The networker agent has not found a high signal match yet. Either we are
        early on profile signups, or this week is just quiet. Check back in six
        hours.
      </p>
    </div>
  );
}

function Section({
  title,
  items,
  highlight,
  muted,
}: {
  title: string;
  items: EnrichedConnection[];
  highlight?: boolean;
  muted?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2
        className={`font-serif text-2xl mb-6 ${
          muted
            ? "text-[color:var(--muted)]"
            : "text-[color:var(--foreground)]"
        }`}
      >
        {title}{" "}
        <span className="text-[color:var(--muted)] text-base">
          ({items.length})
        </span>
      </h2>
      <div className="grid gap-6">
        {items.map((c) => (
          <ConnectionCard key={c.id} c={c} highlight={highlight} />
        ))}
      </div>
    </section>
  );
}

function ConnectionCard({
  c,
  highlight,
}: {
  c: EnrichedConnection;
  highlight?: boolean;
}) {
  const a = c.alumni_a;
  const b = c.alumni_b;
  return (
    <article
      className={`rounded-2xl border bg-white p-7 transition ${
        highlight
          ? "border-[color:var(--primary)] shadow-[0_8px_30px_-12px_rgba(84,28,101,0.25)]"
          : "border-[color:var(--border)]"
      }`}
    >
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="rounded-full bg-[color:var(--primary)] text-[color:var(--on-primary)] px-3 py-1 font-semibold uppercase tracking-widest">
          {OPPORTUNITY_LABELS[c.opportunity_type]}
        </span>
        <span className="rounded-full border border-[color:var(--border)] px-3 py-1 text-[color:var(--muted)]">
          Confidence {c.confidence}
        </span>
        <span className="text-[color:var(--muted)]">
          {new Date(c.generated_at).toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
      </div>

      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        <AlumniBlock label="Alumni A" person={a} fallbackId={c.alumni_a_id} />
        <AlumniBlock label="Alumni B" person={b} fallbackId={c.alumni_b_id} />
      </div>

      <div className="mt-6">
        <div className="text-xs uppercase tracking-widest text-[color:var(--primary)]">
          Why
        </div>
        <p className="mt-2 text-[color:var(--foreground)] leading-relaxed">
          {c.synergy_summary}
        </p>
      </div>

      {c.signals.length > 0 && (
        <ul className="mt-4 list-disc pl-5 space-y-1 text-sm text-[color:var(--muted)]">
          {c.signals.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <div className="text-xs uppercase tracking-widest text-[color:var(--primary)]">
          Drafted intro
        </div>
        <pre className="mt-2 whitespace-pre-wrap font-sans text-[color:var(--foreground)] leading-relaxed bg-[color:var(--primary-50)]/40 rounded-xl p-4 border border-[color:var(--border)]">
{c.suggested_intro_message}
        </pre>
      </div>

      <div className="mt-4 text-[10px] uppercase tracking-widest text-[color:var(--muted)]">
        Generated by {c.generated_by_model}
      </div>
    </article>
  );
}

function AlumniBlock({
  label,
  person,
  fallbackId,
}: {
  label: string;
  person: EnrichedConnection["alumni_a"];
  fallbackId: string;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-[color:var(--muted)]">
        {label}
      </div>
      {person ? (
        <>
          <div className="mt-1 font-serif text-lg text-[color:var(--foreground)]">
            {person.full_name}
          </div>
          <div className="text-sm text-[color:var(--muted)]">
            {person.current_role}
            {person.current_company ? `, ${person.current_company}` : ""}
          </div>
          <div className="text-xs text-[color:var(--muted)] mt-0.5">
            {person.programme} &middot; {person.graduation_year}
          </div>
          {person.linkedin_url && (
            <a
              href={person.linkedin_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm text-[color:var(--primary)] hover:underline"
            >
              LinkedIn
            </a>
          )}
        </>
      ) : (
        <div className="mt-1 text-sm text-[color:var(--muted)] italic">
          Profile {fallbackId.slice(0, 8)} not in current snapshot.
        </div>
      )}
    </div>
  );
}
