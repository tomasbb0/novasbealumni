import Link from "next/link";
import { brand } from "@/lib/brand";
import { RingDash } from "@/components/RingDash";
import { CityCycle } from "@/components/CityCycle";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[color:var(--border)]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_rgba(84,28,101,0.10),_transparent_55%)]" />
        <div className="mx-auto max-w-6xl px-6 pt-24 pb-24 sm:pt-32 sm:pb-32 grid gap-16 lg:grid-cols-[1.4fr_1fr] items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-3 py-1 text-xs uppercase tracking-widest text-[color:var(--primary)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]" />
              {brand.schoolShort} · {brand.city}
            </div>
            <h1 className="mt-6 font-serif text-5xl sm:text-6xl leading-[1.05] max-w-3xl text-[color:var(--foreground)] min-h-[10rem] sm:min-h-[12rem]">
              The Nova SBE alumni community in <CityCycle className="text-[color:var(--primary)] whitespace-nowrap" />.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-[color:var(--muted)] leading-relaxed">
              {brand.description}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/rsvp"
                className="inline-flex items-center rounded-full bg-[color:var(--primary)] px-6 py-3 text-sm font-semibold text-[color:var(--on-primary)] hover:bg-[color:var(--primary-700)] transition"
              >
                RSVP for the first mixer
              </Link>
              <Link
                href="/survey"
                className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[color:var(--foreground)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] transition"
              >
                Tell us what you want
              </Link>
            </div>
          </div>
          <div className="relative hidden lg:flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(84,28,101,0.18),_transparent_70%)] blur-2xl" />
            <RingDash className="relative h-72 w-auto text-black" />
          </div>
        </div>
      </section>

      {/* What it is */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20 grid sm:grid-cols-3 gap-6">
        {[
          { t: "Mixers", d: "Quarterly gatherings in Manhattan. No badges, no name plates, no PowerPoint." },
          { t: "Intros", d: "Warm intros across finance, consulting, tech, and founders. We know who knows whom." },
          { t: "A real list", d: "A WhatsApp group for jobs, sublets, advice, and the occasional rant. Vetted, alumni only." },
        ].map((b) => (
          <div
            key={b.t}
            className="rounded-2xl border border-[color:var(--border)] bg-white p-7 hover:border-[color:var(--primary)] hover:shadow-[0_8px_30px_-12px_rgba(84,28,101,0.25)] transition"
          >
            <div className="text-[color:var(--primary)] text-xs font-semibold tracking-widest uppercase">
              {b.t}
            </div>
            <div className="mt-3 font-serif text-2xl text-[color:var(--foreground)]">
              {b.t === "Mixers" ? "Quarterly, in person" : b.t === "Intros" ? "Warm, not cold" : "Vetted only"}
            </div>
            <div className="mt-3 text-[color:var(--muted)] leading-relaxed">{b.d}</div>
          </div>
        ))}
      </section>

      {/* First event */}
      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="rounded-3xl bg-[color:var(--primary)] text-[color:var(--on-primary)] p-10 sm:p-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-15">
            <RingDash className="h-80 w-auto text-white" />
          </div>
          <div className="relative">
            <div className="text-xs uppercase tracking-widest opacity-80">First event</div>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-white">
              {brand.firstEvent.name}
            </h2>
            <div className="mt-2 opacity-80">
              {brand.firstEvent.dateLabel} · {brand.firstEvent.venueLabel}
            </div>
          </div>
          <Link
            href="/rsvp"
            className="relative inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[color:var(--primary)] hover:bg-[color:var(--primary-50)] transition self-start sm:self-auto"
          >
            RSVP
          </Link>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24 text-center">
        <h2 className="font-serif text-3xl sm:text-4xl text-[color:var(--foreground)]">
          Were you at Carcavelos? Welcome home.
        </h2>
        <p className="mt-4 text-[color:var(--muted)] max-w-xl mx-auto">
          The first 50 alumni shape what this becomes. Get on the list now,
          before we close it.
        </p>
        <div className="mt-8">
          <Link
            href="/rsvp"
            className="inline-flex items-center rounded-full bg-[color:var(--primary)] px-8 py-3 text-base font-semibold text-[color:var(--on-primary)] hover:bg-[color:var(--primary-700)] transition"
          >
            Join the list
          </Link>
        </div>
      </section>
    </div>
  );
}
