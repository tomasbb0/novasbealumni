import Link from "next/link";
import { brand } from "@/lib/brand";
import { NovaCircleDash } from "@/components/NovaCircleDash";
import { CityCycle } from "@/components/CityCycle";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[color:var(--border)]">
        <div className="fixed top-14 inset-x-0 bottom-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_rgba(84,28,101,0.10),_transparent_55%)]" />
        {/* Giant Nova ring: positioned so its centre is past the bottom-right corner of the
            hero, so only the top-left quarter bleeds in. Same circle as the small one, just
            inline so we can tune stroke thickness. */}
        <svg
          viewBox="0 0 100 100"
          aria-hidden
          className="hidden lg:block pointer-events-none select-none absolute"
          style={{
            width: "min(140vh, 1400px)",
            height: "min(140vh, 1400px)",
            right: "calc(min(140vh, 1400px) / -2)",
            bottom: "calc(min(140vh, 1400px) / -2)",
          }}
        >
          <circle cx="50" cy="50" r="39.05" fill="none" stroke="#030403" strokeWidth="18.9" />
        </svg>
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-24 sm:pt-32 sm:pb-32 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-3 py-1 text-xs uppercase tracking-widest text-[color:var(--primary)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]" />
              {brand.schoolShort} · {brand.city}
            </div>
            <h1 className="mt-6 font-serif text-5xl sm:text-6xl leading-[1.05] max-w-3xl text-[color:var(--foreground)] min-h-[10rem] sm:min-h-[12rem]">
              The Nova SBE alumni community
              <br />
              in <CityCycle className="text-[color:var(--primary)] whitespace-nowrap" />.
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
        </div>
      </section>

      {/* What it is */}
      <section className="mx-auto w-full max-w-7xl px-6 py-20 grid sm:grid-cols-3 gap-6">
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

      {/* Platform */}
      <section className="mx-auto w-full max-w-7xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-[color:var(--primary)]">A plataforma</p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-[color:var(--foreground)]">Tudo o que uma comunidade alumni precisa, num só sítio</h2>
          <p className="mt-4 text-[color:var(--muted)]">Directório, eventos, mentoria, vagas, grupos, conversa e notícias. E a Luma por cima de tudo a fazer o trabalho que ninguém tem tempo de fazer.</p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { href: "/agent", t: "Luma", d: "Agente IA que faz introduções, encontra eventos e responde 24/7.", primary: true },
            { href: "/directory", t: "Directory", d: "21.000+ alumni com perfis ricos, filtros por cidade e programa." },
            { href: "/events", t: "Events", d: "Eventos por chapter, RSVP, capacidade em tempo real." },
            { href: "/mentoring", t: "Mentoring", d: "Mentores Nova com disponibilidade visível e pedido directo." },
            { href: "/jobs", t: "Jobs", d: "Vagas publicadas por alumni para alumni, com candidatura nativa." },
            { href: "/forums", t: "Forums", d: "Conversa entre alumni por tema, chapter, programa." },
            { href: "/groups", t: "Groups", d: "Chapters internacionais e grupos de interesse." },
            { href: "/news", t: "News", d: "Spotlights, parcerias, notícias da escola e da comunidade." },
          ].map((b) => (
            <Link
              key={b.href}
              href={b.href}
              className={`rounded-2xl border p-6 transition group ${b.primary ? "border-[color:var(--primary)] bg-[color:var(--primary)] text-white hover:bg-[color:var(--primary-700)]" : "border-[color:var(--border)] bg-white hover:border-[color:var(--primary)]"}`}
            >
              <div className={`text-xs uppercase tracking-widest ${b.primary ? "opacity-80" : "text-[color:var(--primary)]"}`}>{b.primary ? "AI" : "Module"}</div>
              <div className={`mt-2 font-serif text-2xl ${b.primary ? "text-white" : "text-[color:var(--foreground)]"}`}>{b.t}</div>
              <div className={`mt-2 text-sm ${b.primary ? "opacity-90" : "text-[color:var(--muted)]"}`}>{b.d}</div>
              <div className={`mt-4 text-xs ${b.primary ? "opacity-80" : "text-[color:var(--primary)]"} group-hover:translate-x-0.5 transition`}>Abrir →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* First event */}
      <section className="mx-auto w-full max-w-7xl px-6 py-12">
        <div className="rounded-3xl bg-[color:var(--primary)] text-[color:var(--on-primary)] p-10 sm:p-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-15">
            <NovaCircleDash size={160} dashScale={0.56} color="#fff" />
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
      <section className="mx-auto w-full max-w-7xl px-6 py-24 text-center">
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
