import Link from "next/link";
import { brand } from "@/lib/brand";
import { NovaSBEMark } from "./NovaSBEMark";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-[color:var(--border)]">
      <nav className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group" aria-label={brand.name}>
          <NovaSBEMark variant="wordmark" className="h-5 w-auto group-hover:opacity-80 transition" />
          <span className="hidden sm:inline-block w-px h-5 bg-[color:var(--border)]" />
          <span className="hidden sm:inline-block font-serif text-sm tracking-tight text-[color:var(--muted)]">
            Alumni
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm text-[color:var(--foreground)]">
          <Link href="/onboard" className="hover:text-[color:var(--primary)] transition">Join</Link>
          <Link href="/connections" className="hover:text-[color:var(--primary)] transition">Connections</Link>
          <Link href="/agent" className="hover:text-[color:var(--primary)] transition hidden sm:inline">Agent</Link>
          <Link href="/pitch" className="hover:text-[color:var(--primary)] transition hidden sm:inline">For partners</Link>
          <Link
            href="/onboard"
            className="ml-2 inline-flex items-center rounded-full bg-[color:var(--primary)] px-4 py-1.5 text-sm font-medium text-[color:var(--on-primary)] hover:bg-[color:var(--primary-700)] transition"
          >
            Join the list
          </Link>
        </div>
      </nav>
    </header>
  );
}
