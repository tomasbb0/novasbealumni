import Link from "next/link";
import { brand } from "@/lib/brand";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[color:var(--background)]/70 border-b border-[color:var(--border)]">
      <nav className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="inline-block w-2 h-2 rounded-full bg-[color:var(--accent)] group-hover:scale-125 transition" />
          <span className="font-semibold tracking-tight text-[color:var(--foreground)]">
            {brand.name}
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm text-[color:var(--muted)]">
          <Link href="/rsvp" className="hover:text-[color:var(--foreground)] transition">RSVP</Link>
          <Link href="/survey" className="hover:text-[color:var(--foreground)] transition">Survey</Link>
          <Link href="/pitch" className="hover:text-[color:var(--foreground)] transition hidden sm:inline">For partners</Link>
          <Link
            href="/rsvp"
            className="ml-2 inline-flex items-center rounded-full bg-[color:var(--accent)] px-4 py-1.5 text-sm font-medium text-[#0b0b0d] hover:bg-[color:var(--accent-soft)] transition"
          >
            Join the list
          </Link>
        </div>
      </nav>
    </header>
  );
}
