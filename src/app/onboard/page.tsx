import type { Metadata } from "next";
import OnboardChat from "./OnboardChat";

export const metadata: Metadata = {
  title: "Join the network",
  description:
    "Talk to the Nova SBE alumni networker. Two minutes, then it goes to work in the background.",
};

export default function OnboardPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-3 py-1 text-xs uppercase tracking-widest text-[color:var(--primary)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--accent)] animate-pulse" />
          Live with the agent
        </div>
        <h1 className="mt-6 font-serif text-5xl text-[color:var(--foreground)]">
          Join the network
        </h1>
        <p className="mt-4 max-w-2xl text-[color:var(--muted)] leading-relaxed">
          Tell the agent who you are, what you are working on, and what you
          could use. It will keep your details private and only surface intros
          worth your time.
        </p>
      </header>
      <OnboardChat />
    </div>
  );
}
