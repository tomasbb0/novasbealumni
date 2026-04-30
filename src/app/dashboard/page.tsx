"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getProfile, isProfileComplete, type Profile } from "@/lib/profile";
import { brand } from "@/lib/brand";
import { listMyConnections, respondToConnection, type Connection } from "@/lib/connectRequests";
import { listUpcomingEvents, type AlumniEvent } from "@/lib/events";

type EventLite = { id: string; title: string; dateLabel: string; venueLabel: string; rsvpUrl?: string | null };
const fallbackEvents: EventLite[] = [
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
  const [incoming, setIncoming] = useState<Array<Connection & { requesterProfile?: Profile }>>([]);
  const [events, setEvents] = useState<EventLite[]>(fallbackEvents);

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

        try {
          const all = await listMyConnections();
          const pendingIn = all.filter((c) => c.addressee === me!.id && c.status === "pending");
          if (pendingIn.length > 0) {
            const ids = pendingIn.map((c) => c.requester);
            const { data: pp } = await sb.from("profiles").select("*").in("id", ids);
            const byId = new Map((pp as Profile[] || []).map((p) => [p.id, p]));
            setIncoming(pendingIn.map((c) => ({ ...c, requesterProfile: byId.get(c.requester) })));
          }
        } catch { /* table may not yet exist */ }

        try {
          const evs = await listUpcomingEvents(5);
          if (evs.length > 0) {
            setEvents(
              evs.map((e: AlumniEvent) => ({
                id: e.id,
                title: e.title,
                dateLabel: e.date_label || (e.starts_at ? new Date(e.starts_at).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }) : ""),
                venueLabel: [e.venue_label, e.city].filter(Boolean).join(" · "),
                rsvpUrl: e.rsvp_url,
              }))
            );
          }
        } catch { /* events table may not yet exist */ }
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

      {incoming.length > 0 && (
        <div className="mt-8 rounded-lg border border-[color:var(--primary)] bg-[color:var(--primary-50)] p-5">
          <h2 className="font-serif text-lg text-[color:var(--foreground)]">
            {incoming.length} connection request{incoming.length === 1 ? "" : "s"} waiting
          </h2>
          <ul className="mt-3 space-y-2">
            {incoming.map((c) => (
              <li key={c.id} className="flex items-center gap-3 rounded-md bg-white p-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[color:var(--foreground)] truncate">
                    {c.requesterProfile?.full_name || "Someone"}
                  </div>
                  <div className="text-xs text-[color:var(--muted)] truncate">
                    {[c.requesterProfile?.current_role, c.requesterProfile?.current_company].filter(Boolean).join(" @ ")}
                  </div>
                </div>
                <button
                  onClick={async () => { await respondToConnection(c.id, "accepted"); setIncoming((x) => x.filter((y) => y.id !== c.id)); }}
                  className="text-xs font-medium text-white bg-[color:var(--primary)] hover:bg-[color:var(--primary-700)] rounded-full px-3 py-1.5 transition"
                >
                  Accept
                </button>
                <button
                  onClick={async () => { await respondToConnection(c.id, "declined"); setIncoming((x) => x.filter((y) => y.id !== c.id)); }}
                  className="text-xs text-[color:var(--muted)] hover:text-[color:var(--primary)] transition"
                >
                  Decline
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <Section title="Upcoming events" empty="No events on the calendar yet.">
          {events.length > 0 && events.map((e) => (
            <Card key={e.id}
              title={e.title}
              subtitle={[e.dateLabel, e.venueLabel].filter(Boolean).join(" · ")}
              href={e.rsvpUrl || "/rsvp"}
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
