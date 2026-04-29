import { brand } from "@/lib/brand";

export const metadata = { title: "For partners" };

const slides = [
  {
    kicker: "01 · The gap",
    title: "Nova alumni in New York are scattered.",
    body: "Hundreds of Nova SBE graduates live and work in NYC. There is no list, no group, no recurring event. People meet by accident at industry mixers and never again.",
  },
  {
    kicker: "02 · The fix",
    title: "A focused, vetted, alumni-only community.",
    body: "Quarterly mixers, a curated WhatsApp group, and warm intros across finance, consulting, tech and founders. Built by alumni, for alumni. No sponsors on stage, no brand activations.",
  },
  {
    kicker: "03 · Who",
    title: "Senior associate to MD. Founders. Buy side.",
    body: "We start with the 2010–2020 cohort already in NY. First 50 RSVPs shape the rest. Verified via Nova email or LinkedIn cross-check.",
  },
  {
    kicker: "04 · Path",
    title: "Independent first. Nova partnership later.",
    body: "Phase 1: launch independently to prove demand and prove tone. Phase 2: present numbers + testimonials to Nova SBE alumni office for official partnership and budget.",
  },
  {
    kicker: "05 · Ask",
    title: "Backing, not branding.",
    body: "Looking for a small operating budget for the first 3 mixers, plus help with venue introductions in Manhattan. No logo on a banner required.",
  },
];

export default function PitchPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-20">
      <header className="mb-16">
        <div className="text-xs uppercase tracking-widest text-[color:var(--accent)]">
          {brand.name} · for partners
        </div>
        <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">
          A short pitch.
        </h1>
        <p className="mt-4 text-[color:var(--muted)] max-w-2xl">
          Five slides. If you only read one, read slide three.
        </p>
      </header>

      <div className="space-y-6">
        {slides.map((s) => (
          <section
            key={s.kicker}
            className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-10 sm:p-14"
          >
            <div className="text-xs uppercase tracking-widest text-[color:var(--accent)]">
              {s.kicker}
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
              {s.title}
            </h2>
            <p className="mt-5 text-lg text-[color:var(--muted)] leading-relaxed max-w-2xl">
              {s.body}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-[color:var(--muted)]">Reach out:</p>
        <a
          href={`mailto:${brand.contactEmail}`}
          className="mt-2 inline-block text-2xl font-medium text-[color:var(--accent)] hover:underline"
        >
          {brand.contactEmail}
        </a>
      </div>
    </div>
  );
}
