import Link from "next/link";

const examples = [
  { label: "Intro em fintech B2B em Berlim", href: "/networker/?example=0" },
  { label: "Mentor para entrar em IB Londres", href: "/networker/?example=1" },
  { label: "Deal flow SaaS ibérico", href: "/networker/?example=2" },
  { label: "Aconselhamento SaaS em saúde", href: "/networker/?example=3" },
];

export default function LumaCard({ className = "" }: { className?: string }) {
  return (
    <section
      className={`rounded-3xl border border-[#033F85]/20 bg-white p-6 shadow-[0_24px_70px_-45px_rgba(3,63,133,0.65)] ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#033F85]/20 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#033F85]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#033F85]" />
            Luma
          </div>
          <h2 className="mt-3 font-serif text-2xl text-[color:var(--foreground)]">
            Pede uma intro à agente da rede Nova SBE Alumni.
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[color:var(--muted)]">
            A Luma procura entre os alumni quem te pode ajudar, explica o raciocínio e prepara a mensagem para copiares. Clica num cenário para começar.
          </p>
        </div>
        <Link
          href="/networker/"
          className="hidden shrink-0 rounded-full border border-[#033F85]/25 bg-white px-4 py-2 text-sm font-semibold text-[#033F85] transition hover:border-[#033F85] sm:inline-block"
        >
          Abrir Luma
        </Link>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {examples.map((example) => (
          <Link
            key={example.label}
            href={example.href}
            className="rounded-full border border-[#033F85]/25 bg-white px-4 py-2 text-sm font-medium text-[#033F85] transition hover:border-[#033F85] hover:bg-[#033F85]/5"
          >
            {example.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
