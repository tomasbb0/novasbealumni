"use client";

import { useState } from "react";
import { brand } from "@/lib/brand";

type Status = "idle" | "submitting" | "success" | "error";

export function RsvpForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    const data = new FormData(e.currentTarget);
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      gradYear: String(data.get("gradYear") || "").trim(),
      programme: String(data.get("programme") || "").trim(),
      currentRole: String(data.get("currentRole") || "").trim(),
      attending: String(data.get("attending") || "yes"),
      notes: String(data.get("notes") || "").trim(),
    };
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Server returned ${res.status}`);
      }
      setStatus("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something broke. Try again?";
      setErrorMsg(message);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-[color:var(--primary)] bg-[color:var(--card)] p-8">
        <div className="text-[color:var(--primary)] text-xs uppercase tracking-widest">
          You&apos;re in
        </div>
        <h2 className="mt-2 text-2xl font-semibold">See you in NY.</h2>
        <p className="mt-3 text-[color:var(--muted)]">
          We&apos;ll email you the moment the date is locked. In the meantime,
          jump straight into the WhatsApp group.
        </p>
        <a
          href={brand.whatsappInviteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center rounded-full bg-[color:var(--primary)] px-6 py-3 text-sm font-medium text-[#ffffff] hover:bg-[color:var(--primary-700)] transition"
        >
          Join the WhatsApp group →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Full name" name="name" required placeholder="Maria Silva" />
        <Field label="Email" name="email" type="email" required placeholder="maria@example.com" />
        <Field label="Nova grad year" name="gradYear" required placeholder="2018" />
        <Field label="Programme" name="programme" placeholder="MSc Finance, CEMS, BSc, …" />
        <div className="sm:col-span-2">
          <Field label="Current role + company" name="currentRole" placeholder="VP at Goldman Sachs" />
        </div>
      </div>

      <div>
        <Label>Attending the first mixer?</Label>
        <div className="mt-2 flex gap-2">
          {[
            { v: "yes", l: "Yes, count me in" },
            { v: "maybe", l: "Maybe, send details" },
            { v: "list", l: "Just add me to the list" },
          ].map((o) => (
            <label
              key={o.v}
              className="cursor-pointer rounded-full border border-[color:var(--border)] px-4 py-2 text-sm hover:border-[color:var(--primary)] has-[:checked]:bg-[color:var(--primary)] has-[:checked]:text-[#ffffff] has-[:checked]:border-[color:var(--primary)] transition"
            >
              <input
                type="radio"
                name="attending"
                value={o.v}
                defaultChecked={o.v === "yes"}
                className="sr-only"
              />
              {o.l}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label>Anything you want us to know? (optional)</Label>
        <textarea
          name="notes"
          rows={3}
          className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-3 text-sm focus:border-[color:var(--primary)] outline-none transition"
          placeholder="What you're hoping to get from this, who you'd love to meet, etc."
        />
      </div>

      {status === "error" && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center rounded-full bg-[color:var(--primary)] px-6 py-3 text-sm font-medium text-[#ffffff] hover:bg-[color:var(--primary-700)] disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {status === "submitting" ? "Sending…" : "Send RSVP"}
      </button>

      <p className="text-xs text-[color:var(--muted)]">
        We&apos;ll only use your details to coordinate {brand.name}. No
        newsletters, no spam, no LinkedIn growth hacks.
      </p>
    </form>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm text-[color:var(--muted)]">{children}</label>;
}

function Field(props: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <Label>
        {props.label}
        {props.required && <span className="text-[color:var(--primary)]"> *</span>}
      </Label>
      <input
        name={props.name}
        type={props.type || "text"}
        required={props.required}
        placeholder={props.placeholder}
        className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-3 text-sm focus:border-[color:var(--primary)] outline-none transition"
      />
    </div>
  );
}
