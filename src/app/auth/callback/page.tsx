"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getSupabase, hasSupabaseConfig } from "@/lib/supabase";
import { getProfile, isProfileComplete, upsertProfile } from "@/lib/profile";

function CallbackInner() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [msg, setMsg] = useState("Finishing sign-in…");
  const exchanged = useRef(false);

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      setMsg("Supabase env vars missing on this build.");
      return;
    }
    const errParam = params.get("error_description") || params.get("error");
    if (errParam) {
      setMsg(`Sign-in failed: ${errParam}`);
      return;
    }
    if (exchanged.current) return;
    exchanged.current = true;

    (async () => {
      const supabase = getSupabase();
      const code = params.get("code");
      let session = (await supabase.auth.getSession()).data.session;

      if (!session && code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          setMsg(`Sign-in failed: ${error.message}. Tenta de novo a partir de /signin (mesmo browser, sem modo anónimo).`);
          return;
        }
        session = data.session;
      }

      if (!session) {
        setMsg("Sem sessão. Volta a /signin e tenta outra vez.");
        return;
      }

      const u = session.user;
      let profile = await getProfile(u.id);
      if (!profile) {
        const meta = (u.user_metadata || {}) as Record<string, unknown>;
        try {
          await upsertProfile({
            id: u.id,
            full_name: (meta.full_name as string) || (meta.name as string) || null,
            avatar_url: (meta.avatar_url as string) || (meta.picture as string) || null,
          });
          profile = await getProfile(u.id);
        } catch {
          // RLS or race; onboarding will retry.
        }
      }
      const next = params.get("next") || (isProfileComplete(profile) ? "/dashboard" : "/onboarding");
      router.replace(next);
    })().catch((e) => {
      setMsg(`Sign-in failed: ${e instanceof Error ? e.message : String(e)}`);
    });
  }, [params, router]);

  // Fallback: if user appears via onAuthStateChange after the effect already finished
  useEffect(() => {
    if (user && exchanged.current) {
      // already handled inside the main effect
    }
  }, [user]);

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
