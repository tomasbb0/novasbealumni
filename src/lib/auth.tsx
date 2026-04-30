"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase, hasSupabaseConfig } from "./supabase";

type AuthState = {
  ready: boolean;
  configured: boolean;
  user: User | null;
  session: Session | null;
  signInWithLinkedIn: (redirectTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(() => !hasSupabaseConfig());
  const [session, setSession] = useState<Session | null>(null);
  const configured = hasSupabaseConfig();

  useEffect(() => {
    if (!configured) return;
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, [configured]);

  const value = useMemo<AuthState>(
    () => ({
      ready,
      configured,
      user: session?.user ?? null,
      session,
      async signInWithLinkedIn(redirectTo) {
        const supabase = getSupabase();
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        await supabase.auth.signInWithOAuth({
          provider: "linkedin_oidc",
          options: {
            redirectTo: `${origin}/auth/callback${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ""}`,
            scopes: "openid profile email",
          },
        });
      },
      async signOut() {
        const supabase = getSupabase();
        await supabase.auth.signOut();
      },
    }),
    [ready, configured, session]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside <AuthProvider>");
  return v;
}
