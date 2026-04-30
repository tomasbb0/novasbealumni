"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function SignInInner() {
  const { ready, configured, user, signInWithLinkedIn } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, router, next]);

  async function onSignIn() {
    setBusy(true);
    setErr(null);
    try {
      await signInWithLinkedIn(next);
    } catch (e) {
      setBusy(false);
      setErr(e instanceof Error ? e.message : "Sign-in failed.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-6 py-20">
      <h1 className="font-serif text-4xl text-[color:var(--foreground)]">Sign in</h1>
      <p className="mt-3 text-[color:var(--muted)] leading-relaxed">
        Use LinkedIn so we know you are you. We only read your name, email and headline.
      </p>

      {!configured && (
        <div className="mt-8 rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] p-4 text-sm text-[color:var(--foreground)]">
          Sign-in is not configured yet. The site owner needs to finish the
          one-time Supabase + LinkedIn setup. See <code>SETUP_AUTH.md</code> in
          the repo.
        </div>
      )}

      <button
        onClick={onSignIn}
        disabled={busy || !configured}
        className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#0A66C2] px-5 py-3 text-white text-sm font-medium hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LinkedInIcon className="h-5 w-5" />
        {busy ? "Opening LinkedIn…" : "Continue with LinkedIn"}
      </button>

      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}

      <p className="mt-10 text-xs text-[color:var(--muted)]">
        Not a Nova SBE alumnus?{" "}
        <Link href="/onboard" className="underline">
          Join the public waitlist instead
        </Link>
        .
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-md px-6 py-20">Loading…</div>}>
      <SignInInner />
    </Suspense>
  );
}
