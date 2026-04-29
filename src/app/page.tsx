import Link from "next/link";
import { brand } from "@/lib/brand";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(200,162,91,0.18),_transparent_60%)]" />
        <div className="mx-auto max-w-6xl px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-1 text-xs uppercase tracking-widest text-[color:var(--muted)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]" />
            {brand.schoolShort} · {brand.city}
          </div>
          <h1 className="mt-6 text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05] max-w-3xl">
            The {brand.schoolShort} alumni community in <span className="text-[color:var(--accent)]">New York</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-[color:var(--muted)]">
            {brand.description}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/rsvp"
              className="inline-flex items-center rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-medium text-[#0b0b0d] hover:bg-[color:var(--accent-soft)] transition"
            >
              RSVP for the first mixer
            </Link>
            <Link
              href="/survey"
              className="inline-flex items-center rounded-full border border-[color:var(--border)] px-6 py-3 text-sm font-medium hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] transition"
            >
              Tell us what you want
            </Link>
          </div>
        </div>
      </section>

      {/* What it is */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16 grid sm:grid-cols-3 gap-6">
        {[
          {
            t: "Mixers",
            d: "Quarterly gatherings in Manhattan. No badges, no name plates, no PowerPoint.",
          },
          {
            t: "Intros",
            d: "Warm intros across finance, consulting, tech, and founders. We know who knows whom.",
          },
          {
            t: "A real list",
            d: "A WhatsApp group for jobs, sublets, advice, and the occasional rant. Vetted, alumni only.",
          },
        ].map((b) => (
          <div
            key={b.t}
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 hover:border-[color:var(--accent)] transition"
          >
            <div className="text-[color:var(--accent)] text-sm font-medium tracking-wide uppercase">
              {b.t}
            </div>
            <div className="mt-3 text-[color:var(--foreground)] text-base leading-relaxed">
              {b.d}
            </div>
          </div>
        ))}
      </section>

      {/* First event */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="rounded-3xl border border-[color:var(--border)] bg-gradient-to-br from-[color:var(--card)] to-[#0b0b0d] p-10 sm:p-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
          <div>
            <div className="text-xs uppercase tracking-widest text-[color:var(--accent)]">
              First event
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
              {brand.firstEvent.name}
            </h2>
            <div className="mt-2 text-[color:var(--muted)]">
              {brand.firstEvent.dateLabel} · {brand.firstEvent.venueLabel}
            </div>
          </div>
          <Link
            href="/rsvp"
            className="inline-flex items-center rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-medium text-[#0b0b0d] hover:bg-[color:var(--accent-soft)] transition self-start sm:self-auto"
          >
            Save my spot →
          </Link>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Were you at Carcavelos? Welcome home.
        </h2>
        <p className="mt-4 text-[color:var(--muted)] max-w-xl mx-auto">
          The first 50 alumni shape what this becomes. Get on the list now,
          before we close it.
        </p>
        <div className="mt-8">
          <Link
            href="/rsvp"
            className="inline-flex items-center rounded-full bg-[color:var(--accent)] px-8 py-3 text-base font-medium text-[#0b0b0d] hover:bg-[color:var(--accent-soft)] transition"
          >
            Join the list
          </Link>
        </div>
      </section>
    </div>
  );
}
