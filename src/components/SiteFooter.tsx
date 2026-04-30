import Link from "next/link";
import { brand } from "@/lib/brand";
import { NMark } from "./NMark";

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--border)] mt-24 bg-[color:var(--card)]">
      <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col sm:flex-row gap-8 sm:items-start sm:justify-between text-sm text-[color:var(--muted)]">
        <div>
          <div className="flex items-center gap-2 text-[color:var(--foreground)]">
            <NMark size={20} className="text-[color:var(--primary)]" />
            <span className="font-serif text-base">{brand.name}</span>
          </div>
          <div className="mt-2 max-w-sm">
            An independent alumni initiative. Not officially affiliated with {brand.school}.
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/rsvp" className="hover:text-[color:var(--primary)] transition">RSVP</Link>
          <Link href="/survey" className="hover:text-[color:var(--primary)] transition">Survey</Link>
          <Link href="/pitch" className="hover:text-[color:var(--primary)] transition">For partners</Link>
          <a href={`mailto:${brand.contactEmail}`} className="hover:text-[color:var(--primary)] transition">
            {brand.contactEmail}
          </a>
        </div>
      </div>
    </footer>
  );
}
