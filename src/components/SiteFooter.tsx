import Link from "next/link";
import { brand } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--border)] mt-24">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between text-sm text-[color:var(--muted)]">
        <div>
          <div className="text-[color:var(--foreground)] font-medium">{brand.name}</div>
          <div className="mt-1">{brand.school} · {brand.city}</div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/rsvp" className="hover:text-[color:var(--foreground)] transition">RSVP</Link>
          <Link href="/survey" className="hover:text-[color:var(--foreground)] transition">Survey</Link>
          <Link href="/pitch" className="hover:text-[color:var(--foreground)] transition">For partners</Link>
          <a href={`mailto:${brand.contactEmail}`} className="hover:text-[color:var(--foreground)] transition">
            {brand.contactEmail}
          </a>
        </div>
      </div>
    </footer>
  );
}
