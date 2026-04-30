import type { Metadata } from "next";
import Link from "next/link";
import { getProfiles, getProposedConnections, groupByStatus } from "@/lib/connections";
import { getActivity } from "@/lib/activity";

export const metadata: Metadata = {
  title: "Admin",
  description: "Operator view of the Nova SBE alumni network.",
};

export default function AdminPage() {
  const profiles = getProfiles();
  const all = getProposedConnections();
  const groups = groupByStatus(all);
  const activity = getActivity();
  const last = activity[0];

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16">
      <header className="mb-10">
        <h1 className="font-serif text-5xl text-[color:var(--foreground)]">
          Admin
        </h1>
        <p className="mt-3 text-[color:var(--muted)]">
          Read-only operator view. State changes happen via the in-app agent.
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Profiles" value={profiles.length} href="/connections" />
        <Stat label="Pending" value={groups.pending.length} href="/connections" highlight />
        <Stat label="Sent" value={groups.sent.length} href="/connections" />
        <Stat label="Successful" value={groups.successful.length} href="/connections" />
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-2">
        <Card title="Last agent action" href="/agent">
          {last ? (
            <>
              <div className="text-xs uppercase tracking-widest text-[color:var(--primary)]">
                {last.kind.replace("_", " ")}
              </div>
              <p className="mt-2 text-[color:var(--foreground)]">{last.summary}</p>
              <div className="mt-3 text-xs text-[color:var(--muted)]">
                {new Date(last.ts).toLocaleString("en-GB")}
              </div>
            </>
          ) : (
            <p className="text-[color:var(--muted)]">No activity yet.</p>
          )}
        </Card>

        <Card title="Recent profiles" href="/connections">
          {profiles.length === 0 ? (
            <p className="text-[color:var(--muted)]">No profiles yet.</p>
          ) : (
            <ul className="space-y-2">
              {profiles
                .slice()
                .sort((a, b) => b.created_at.localeCompare(a.created_at))
                .slice(0, 5)
                .map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/alumni/${p.id}`}
                      className="text-[color:var(--foreground)] hover:text-[color:var(--primary)] transition"
                    >
                      {p.full_name}{" "}
                      <span className="text-[color:var(--muted)] text-sm">
                        — {p.current_role}, {p.current_company}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          )}
        </Card>
      </section>

      <section className="mt-12 rounded-3xl border border-[color:var(--border)] bg-white p-8">
        <h2 className="font-serif text-2xl text-[color:var(--foreground)]">
          How to change something
        </h2>
        <p className="mt-3 text-[color:var(--muted)] leading-relaxed">
          This site is a static export. To approve, dismiss, or change the
          status of a proposed connection, talk to the agent (e.g. mark it
          sent), or edit{" "}
          <code className="text-sm">data/proposed-connections.json</code>{" "}
          directly and push. The site rebuilds automatically.
        </p>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  highlight,
}: {
  label: string;
  value: number;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-2xl border bg-white p-6 transition hover:shadow-[0_8px_30px_-12px_rgba(84,28,101,0.25)] ${
        highlight
          ? "border-[color:var(--primary)]"
          : "border-[color:var(--border)]"
      }`}
    >
      <div className="text-xs uppercase tracking-widest text-[color:var(--primary)]">
        {label}
      </div>
      <div className="mt-2 font-serif text-4xl text-[color:var(--foreground)]">
        {value}
      </div>
    </Link>
  );
}

function Card({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-[color:var(--border)] bg-white p-6 transition hover:shadow-[0_8px_30px_-12px_rgba(84,28,101,0.25)]"
    >
      <h3 className="text-xs uppercase tracking-widest text-[color:var(--primary)] mb-3">
        {title}
      </h3>
      {children}
    </Link>
  );
}
