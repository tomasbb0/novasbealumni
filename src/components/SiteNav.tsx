"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { brand } from "@/lib/brand";
import { NovaLogo } from "./NovaLogo";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/lib/auth";

const platformLinks = [
  { href: "/directory", label: "Directory" },
  { href: "/events", label: "Events" },
  { href: "/mentoring", label: "Mentoring" },
  { href: "/jobs", label: "Jobs" },
  { href: "/forums", label: "Forums" },
  { href: "/groups", label: "Groups" },
  { href: "/news", label: "News" },
  { href: "/agent", label: "Luma" },
];

export function SiteNav() {
  const { configured, user } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const showModules = configured && user;
  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-end gap-2 sm:gap-3 group text-black shrink-0" aria-label={brand.name} onClick={() => setMobileOpen(false)}>
            <NovaLogo size={20} showSignature={false} animate />
            <span className="hidden sm:inline-block w-px h-5 bg-[color:var(--border)] mb-1" />
            <span className="hidden sm:inline-block font-serif text-sm tracking-tight text-[color:var(--muted)] mb-0.5">
              Alumni Club
            </span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            {showModules && (
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((o) => !o)}
                className="md:hidden relative h-9 w-9 grid place-items-center rounded-full border border-[color:var(--border)] text-[color:var(--foreground)] hover:text-[color:var(--primary)] transition"
              >
                <span
                  className={`absolute h-px w-4 bg-current transition-transform duration-200 ${mobileOpen ? "rotate-45" : "-translate-y-1.5"}`}
                />
                <span
                  className={`absolute h-px w-4 bg-current transition-opacity duration-200 ${mobileOpen ? "opacity-0" : "opacity-100"}`}
                />
                <span
                  className={`absolute h-px w-4 bg-current transition-transform duration-200 ${mobileOpen ? "-rotate-45" : "translate-y-1.5"}`}
                />
              </button>
            )}
            {configured && user ? (
              <UserMenu />
            ) : (
              <Link href="/signin" className="px-3 py-1.5 rounded-full whitespace-nowrap text-[color:var(--foreground)] hover:text-[color:var(--primary)] transition">Sign in</Link>
            )}
          </div>
        </div>
      </header>
      {showModules && (
        <>
          <div className="hidden md:block mx-auto max-w-7xl px-6 mt-3">
            <nav className="w-full rounded-full border border-[color:var(--border)] bg-white/90 shadow-sm overflow-x-auto">
              <div className="flex items-center gap-1 px-2 py-1.5 text-sm whitespace-nowrap">
                <Link
                  href="/dashboard"
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap transition ${pathname === "/dashboard" ? "bg-[color:var(--primary)] text-white" : "text-[color:var(--foreground)] hover:text-[color:var(--primary)]"}`}
                >
                  Dashboard
                </Link>
                {platformLinks.map((l) => {
                  const active = pathname === l.href || pathname?.startsWith(l.href + "/");
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={`px-3 py-1.5 rounded-full whitespace-nowrap transition ${active ? "bg-[color:var(--primary)] text-white" : "text-[color:var(--foreground)] hover:text-[color:var(--primary)]"}`}
                    >
                      {l.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
          {mobileOpen && (
            <div className="md:hidden mx-auto max-w-7xl px-4 mt-3">
              <nav className="w-full rounded-2xl border border-[color:var(--border)] bg-white/95 shadow-sm">
                <div className="flex flex-col p-2 text-sm">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2 rounded-xl transition ${pathname === "/dashboard" ? "bg-[color:var(--primary)] text-white" : "text-[color:var(--foreground)] hover:bg-[color:var(--primary)]/5"}`}
                  >
                    Dashboard
                  </Link>
                  {platformLinks.map((l) => {
                    const active = pathname === l.href || pathname?.startsWith(l.href + "/");
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={() => setMobileOpen(false)}
                        className={`px-3 py-2 rounded-xl transition ${active ? "bg-[color:var(--primary)] text-white" : "text-[color:var(--foreground)] hover:bg-[color:var(--primary)]/5"}`}
                      >
                        {l.label}
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>
          )}
        </>
      )}
    </>
  );
}
