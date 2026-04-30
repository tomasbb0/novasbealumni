"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "agent" | "user"; text: string; ts: number };

const ENDPOINT = process.env.NEXT_PUBLIC_AGENT_CHAT_URL ?? "";

const OPENING = [
  "Hi. I am the Nova SBE alumni networker.",
  "I will ask you a few questions, then quietly look for high signal connections inside the NYC alumni network. No spam, no LinkedIn theatre.",
  "Ready when you are. What is your full name and Nova SBE programme + graduation year?",
].join("\n\n");

export default function OnboardChat() {
  const [messages, setMessages] = useState<Msg[]>(() => [
    { role: "agent", text: OPENING, ts: Date.now() },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef<string>("");

  useEffect(() => {
    if (sessionId.current === "") {
      sessionId.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `s-${Date.now()}`;
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, pending]);

  async function send() {
    const text = input.trim();
    if (!text || pending) return;
    setError(null);
    setMessages((m) => [...m, { role: "user", text, ts: Date.now() }]);
    setInput("");

    if (!ENDPOINT) {
      setMessages((m) => [
        ...m,
        {
          role: "agent",
          text:
            "(The onboarding agent is not wired to its backend yet. Set NEXT_PUBLIC_AGENT_CHAT_URL at build time once the in-app agent exposes its endpoint.)",
          ts: Date.now(),
        },
      ]);
      return;
    }

    setPending(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId.current,
          message: text,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });
      if (!res.ok) throw new Error(`Agent returned ${res.status}`);
      const data = (await res.json()) as { reply?: string };
      setMessages((m) => [
        ...m,
        {
          role: "agent",
          text: data.reply ?? "(empty reply)",
          ts: Date.now(),
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-3xl border border-[color:var(--border)] bg-white overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-5 py-3 leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-[color:var(--primary)] text-[color:var(--on-primary)]"
                  : "bg-[color:var(--primary-50)]/60 text-[color:var(--foreground)] border border-[color:var(--border)]"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {pending && (
          <div className="flex justify-start">
            <div className="max-w-[75%] rounded-2xl px-5 py-3 bg-[color:var(--primary-50)]/60 border border-[color:var(--border)] text-[color:var(--muted)] italic">
              thinking...
            </div>
          </div>
        )}
        {error && (
          <div className="text-sm text-[color:var(--accent)]">
            {error}. Try again.
          </div>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
        className="border-t border-[color:var(--border)] p-4 flex gap-3 bg-white"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your reply..."
          className="flex-1 rounded-full border border-[color:var(--border)] px-5 py-3 outline-none focus:border-[color:var(--primary)] transition"
          disabled={pending}
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="rounded-full bg-[color:var(--primary)] text-[color:var(--on-primary)] px-6 py-3 font-medium disabled:opacity-40 hover:bg-[color:var(--primary-700)] transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}
