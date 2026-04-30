"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import type { Profile } from "@/lib/profile";

function initialsOf(name?: string | null, email?: string | null) {
  const src = (name || email || "?").trim();
  if (!src) return "?";
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<Pick<Profile, "full_name" | "avatar_url"> | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getSupabase()
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) setProfile(data as Pick<Profile, "full_name" | "avatar_url">);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  const name =
    profile?.full_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email ||
    "Account";
  const avatar =
    profile?.avatar_url ||
    (user.user_metadata?.avatar_url as string | undefined) ||
    (user.user_metadata?.picture as string | undefined) ||
    null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-black/5 transition"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <span className="w-7 h-7 rounded-full bg-[color:var(--primary)] text-[color:var(--on-primary)] text-xs font-medium grid place-items-center">
            {initialsOf(name, user.email)}
          </span>
        )}
        <span className="hidden md:inline text-sm text-[color:var(--foreground)] max-w-[8rem] truncate">
          {name}
        </span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-xl border border-[color:var(--border)] bg-white shadow-lg overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b border-[color:var(--border)]">
            <div className="text-sm font-medium text-[color:var(--foreground)] truncate">{name}</div>
            {user.email && (
              <div className="text-xs text-[color:var(--muted)] truncate">{user.email}</div>
            )}
          </div>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm hover:bg-black/5"
            role="menuitem"
          >
            Dashboard
          </Link>
          <Link
            href="/directory"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm hover:bg-black/5"
            role="menuitem"
          >
            Directory
          </Link>
          <Link
            href="/onboarding"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm hover:bg-black/5"
            role="menuitem"
          >
            Edit profile
          </Link>
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await signOut();
            }}
            className="w-full text-left px-4 py-2 text-sm text-[color:var(--muted)] hover:bg-black/5 hover:text-[color:var(--primary)] border-t border-[color:var(--border)]"
            role="menuitem"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
