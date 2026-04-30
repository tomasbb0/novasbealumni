import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfiles, getProposedConnections } from "@/lib/connections";

export function generateStaticParams() {
  const profiles = getProfiles();
  if (profiles.length === 0) return [{ id: "_placeholder" }];
  return profiles.map((p) => ({ id: p.id }));
}

export const dynamicParams = false;

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const profile = getProfiles().find((p) => p.id === id);
  if (!profile) return { title: "Alumni" };
  return {
    title: `${profile.full_name} — Nova SBE NYC`,
    description: `${profile.current_role} at ${profile.current_company}.`,
  };
}

export default async function AlumniProfilePage({ params }: Params) {
  const { id } = await params;
  const profile = getProfiles().find((p) => p.id === id);
  if (!profile) notFound();

  const related = getProposedConnections().filter(
    (c) => c.alumni_a_id === id || c.alumni_b_id === id
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <Link
        href="/connections"
        className="text-sm text-[color:var(--muted)] hover:text-[color:var(--primary)] transition"
      >
        &larr; All connections
      </Link>

      <header className="mt-6">
        <h1 className="font-serif text-5xl text-[color:var(--foreground)]">
          {profile.full_name}
        </h1>
        <p className="mt-3 text-lg text-[color:var(--muted)]">
          {profile.current_role} at {profile.current_company}
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-widest text-[color:var(--primary)]">
          <span className="rounded-full border border-[color:var(--border)] px-3 py-1">
            {profile.programme} {profile.graduation_year}
          </span>
          <span className="rounded-full border border-[color:var(--border)] px-3 py-1">
            {profile.industry}
          </span>
          <span className="rounded-full border border-[color:var(--border)] px-3 py-1">
            {profile.city}
          </span>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="text-xs uppercase tracking-widest text-[color:var(--primary)]">
          Bio
        </h2>
        <p className="mt-3 text-[color:var(--foreground)] leading-relaxed">
          {profile.bio}
        </p>
      </section>

      <div className="mt-10 grid gap-8 sm:grid-cols-3">
        <ChipList title="Expertise" items={profile.expertise} />
        <ChipList title="Looking for" items={profile.looking_for} />
        <ChipList title="Can offer" items={profile.can_offer} />
      </div>

      <section className="mt-10">
        <h2 className="text-xs uppercase tracking-widest text-[color:var(--primary)]">
          Open to
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {profile.open_to.map((o) => (
            <span
              key={o}
              className="rounded-full bg-[color:var(--primary)] text-[color:var(--on-primary)] px-3 py-1 text-xs uppercase tracking-widest"
            >
              {o.replace("_", " ")}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl text-[color:var(--foreground)]">
          Proposed connections involving {profile.full_name.split(" ")[0]}{" "}
          <span className="text-[color:var(--muted)] text-base">
            ({related.length})
          </span>
        </h2>
        {related.length === 0 ? (
          <p className="mt-3 text-[color:var(--muted)]">
            None yet. The agent will surface matches when it finds high signal
            ones.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {related.map((c) => {
              const other = c.alumni_a_id === id ? c.alumni_b : c.alumni_a;
              return (
                <li
                  key={c.id}
                  className="rounded-2xl border border-[color:var(--border)] bg-white p-5"
                >
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="rounded-full bg-[color:var(--primary)] text-[color:var(--on-primary)] px-3 py-1 uppercase tracking-widest">
                      {c.opportunity_type.replace("_", " ")}
                    </span>
                    <span className="text-[color:var(--muted)]">
                      with {other?.full_name ?? "(unknown)"}
                    </span>
                  </div>
                  <p className="mt-3 text-[color:var(--foreground)] leading-relaxed">
                    {c.synergy_summary}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function ChipList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-widest text-[color:var(--primary)]">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-[color:var(--muted)]">—</p>
      ) : (
        <ul className="mt-3 space-y-1 text-sm text-[color:var(--foreground)]">
          {items.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
