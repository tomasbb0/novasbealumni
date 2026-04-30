"use client";

import Link from "next/link";
import { brand } from "@/lib/brand";
import { NovaLogo } from "./NovaLogo";
import { useAuth } from "@/lib/auth";

export function SiteNav() {
  const { configured, user, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-[color:var(--border)]">
      <nav className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-end gap-3 group text-black shrink-0" aria-label={brand.name}>
          <NovaLogo size={20} showSignature={false} animate />
          <span className="hidden sm:inline-block w-px h-5 bg-[color:var(--border)] mb-1" />
          <span className="hidden sm:inline-block font-serif text-sm tracking-tight text-[color:var(--muted)] mb-0.5">
            Alumni Club
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm text-[color:var(--foreground)]">
          <Link href="/onboard" className="hover:text-[color:var(--primary)] transition">Join</Link>
          <Link href="/connections" className="hover:text-[color:var(--primary)] transition">Connections</Link>
          <Link href="/agent" className="hover:text-[color:var(--primary)] transition hidden sm:inline">Agent</Link>
          <Link href="/pitch" className="hover:text-[color:var(--primary)] transition hidden sm:inline">For partners</Link>
          {configured && user ? (
            <>
              <Link href="/dashboard" className="hover:text-[color:var(--primary)] transition">Dashboard</Link>
              <button onClick={signOut} className="text-[color:var(--muted)] hover:text-[color:var(--primary)] transition">Sign out</button>
            </>
          ) : (
            <Link href="/signin" className="hover:text-[color:var(--primary)] transition">Sign in</Link>
          )}
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
