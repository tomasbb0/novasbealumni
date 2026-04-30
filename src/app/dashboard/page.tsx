"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getProfile, isProfileComplete, type Profile } from "@/lib/profile";
import { brand } from "@/lib/brand";

type EventLite = { id: string; title: string; dateLabel: string; venueLabel: string };
const events: EventLite[] = [
  {
    id: "first",
    title: brand.firstEvent.name,
    dateLabel: brand.firstEvent.dateLabel,
    venueLabel: brand.firstEvent.venueLabel,
  },
];

export default function DashboardPage() {
  const { ready, configured, user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [nearby, setNearby] = useState<Profile[]>([]);
  const [intros, setIntros] = useState<Profile[]>([]);

  useEffect(() => {
    if (!ready) return;
    if (!configured) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    if (!user) {
      router.replace("/signin?next=/dashboard");
      return;
    }
    (async () => {
      try {
        const me = await getProfile(user.id);
        if (!isProfileComplete(me)) {
          router.replace("/onboarding");
          return;
        }
        setProfile(me);

        const { getSupabase } = await import("@/lib/supabase");
        const sb = getSupabase();
        if (me?.city) {
          const { data } = await sb
            .from("profiles")
            .select("*")
            .eq("city", me.city)
            .neq("id", me.id)
            .order("updated_at", { ascending: false })
            .limit(5);
          setNearby((data as Profile[]) || []);
        }
        if (me?.programme) {
          let q = sb
            .from("profiles")
            .select("*")
            .eq("programme", me.programme)
            .neq("id", me.id);
          if (me.city) q = q.neq("city", me.city);
          const { data } = await q
            .order("updated_at", { ascending: false })
            .limit(3);
          setIntros((data as Profile[]) || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [ready, configured, user, router]);

  if (!ready || loading) {
    return <div className="mx-auto w-full max-w-5xl px-6 py-16 text-[color:var(--muted)]">Loading your dashboard…</div>;
  }

  if (!configured) {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-20">
        <h1 className="font-serif text-3xl">Dashboard</h1>
        <p className="mt-3 text-[color:var(--muted)]">
          Sign-in is not configured yet. The site owner needs to finish the
          one-time Supabase + LinkedIn setup. See <code>SETUP_AUTH.md</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-widest text-[color:var(--primary)]">Welcome back</p>
          <h1 className="mt-2 font-serif text-4xl text-[color:var(--foreground)]">
            Hi {profile?.full_name?.split(" ")[0] || "there"}.
          </h1>
          {profile?.city && (
            <p className="mt-1 text-[color:var(--muted)]">Here is what is happening around {profile.city}.</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/onboarding" className="text-sm text-[color:var(--muted)] hover:text-[color:var(--primary)]">Edit profile</Link>
          <button onClick={signOut} className="text-sm text-[color:var(--muted)] hover:text-[color:var(--primary)]">Sign out</button>
        </div>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <Section title="Upcoming events" empty="No events on the calendar yet.">
          {events.length > 0 && events.map((e) => (
            <Card key={e.id}
              title={e.title}
              subtitle={[e.dateLabel, e.venueLabel].filter(Boolean).join(" · ")}
              href="/rsvp"
              cta="RSVP"
            />
          ))}
        </Section>

        <Section title={`New alumni${profile?.city ? ` in ${profile.city}` : " nearby"}`} empty="No new alumni in your city yet. You might be the first.">
          {nearby.map((p) => (
            <PersonCard key={p.id}
              title={p.full_name || "Alumnus"}
              subtitle={[p.current_role, p.current_company].filter(Boolean).join(" @ ") || p.headline || ""}
              avatar={p.avatar_url}
            />
          ))}
        </Section>

        <Section title="Suggested intros" empty="We will suggest intros once a few more alumni from your programme are on the platform.">
          {intros.map((p) => (
            <PersonCard key={p.id}
              title={p.full_name || "Alumnus"}
              subtitle={[p.programme, p.city].filter(Boolean).join(" · ")}
              avatar={p.avatar_url}
            />
          ))}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const items = Array.isArray(children) ? children : [children];
  const hasItems = items.some((c) => c);
  return (
    <section>
      <h2 className="font-serif text-xl text-[color:var(--foreground)] mb-3">{title}</h2>
      {hasItems ? <div className="space-y-3">{children}</div> : <p className="text-sm text-[color:var(--muted)] italic">{empty}</p>}
    </section>
  );
}

function Card({ title, subtitle, href, cta, avatar }: { title: string; subtitle?: string; href: string; cta: string; avatar?: string | null }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border border-[color:var(--border)] bg-white p-3 hover:border-[color:var(--primary)] transition"
    >
      {avatar && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[color:var(--foreground)] truncate">{title}</div>
        {subtitle && <div className="text-xs text-[color:var(--muted)] truncate">{subtitle}</div>}
      </div>
      <span className="text-xs font-medium text-[color:var(--primary)]">{cta} →</span>
    </Link>
  );
}

function PersonCard({ title, subtitle, avatar }: { title: string; subtitle?: string; avatar?: string | null }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[color:var(--border)] bg-white p-3">
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
      ) : (
        <div className="h-10 w-10 rounded-full bg-[color:var(--primary-50)] flex items-center justify-center text-[color:var(--primary)] text-sm font-medium">
          {title.slice(0, 1)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[color:var(--foreground)] truncate">{title}</div>
        {subtitle && <div className="text-xs text-[color:var(--muted)] truncate">{subtitle}</div>}
      </div>
    </div>
  );
}
