"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getProfile, isProfileComplete } from "@/lib/profile";

function CallbackInner() {
  const { ready, user } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [msg, setMsg] = useState("Finishing sign-in…");

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      const err = params.get("error_description") || params.get("error");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMsg(err ? `Sign-in failed: ${err}` : "Waiting for session…");
      return;
    }
    (async () => {
      try {
        const profile = await getProfile(user.id);
        const next = params.get("next") || (isProfileComplete(profile) ? "/dashboard" : "/onboarding");
        router.replace(next);
      } catch {
        router.replace("/onboarding");
      }
    })();
  }, [ready, user, router, params]);

  return (
    <div className="mx-auto w-full max-w-md px-6 py-20 text-[color:var(--muted)]">
      {msg}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-md px-6 py-20">Loading…</div>}>
      <CallbackInner />
    </Suspense>
  );
}
