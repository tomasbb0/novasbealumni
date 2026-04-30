import type { Metadata } from "next";
import { ACTIVITY_LABELS, getActivity } from "@/lib/activity";

export const metadata: Metadata = {
  title: "Agent activity",
  description:
    "Live feed of what the Nova SBE 24/7 OpenClaw agent has been up to.",
};

export default function AgentPage() {
  const activity = getActivity();

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-3 py-1 text-xs uppercase tracking-widest text-[color:var(--primary)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--accent)] animate-pulse" />
          OpenClaw activity
        </div>
        <h1 className="mt-6 font-serif text-5xl text-[color:var(--foreground)]">
          Agent activity
        </h1>
        <p className="mt-4 max-w-2xl text-[color:var(--muted)] leading-relaxed">
          Everything the 24/7 agent did, newest first. Profile additions, intro
          drafts, status flips, errors, and the rare moments it edits its own
          rules.
        </p>
      </header>

      {activity.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[color:var(--border)] bg-white p-12 text-center">
          <h2 className="font-serif text-2xl text-[color:var(--foreground)]">
            Quiet so far.
          </h2>
          <p className="mt-3 text-[color:var(--muted)] max-w-md mx-auto">
            The agent is online but has not made noise yet. As soon as it
            ticks, you will see it here.
          </p>
        </div>
      ) : (
        <ol className="relative border-l border-[color:var(--border)] ml-2 space-y-6">
          {activity.map((a) => (
            <li key={a.id} className="pl-6 relative">
              <span className="absolute -left-[7px] top-2 w-3 h-3 rounded-full bg-[color:var(--primary)]" />
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="rounded-full bg-[color:var(--primary)] text-[color:var(--on-primary)] px-3 py-1 uppercase tracking-widest">
                  {ACTIVITY_LABELS[a.kind]}
                </span>
                <time className="text-[color:var(--muted)]">
                  {new Date(a.ts).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </time>
                <span className="text-[color:var(--muted)]">{a.model}</span>
              </div>
              <p className="mt-2 text-[color:var(--foreground)] leading-relaxed">
                {a.summary}
              </p>
              {a.details && (
                <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-[color:var(--muted)] bg-[color:var(--primary-50)]/40 rounded-xl p-4 border border-[color:var(--border)]">
                  {a.details}
                </pre>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
