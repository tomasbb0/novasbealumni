"use client";

import { useEffect, useRef } from "react";
import { brand } from "@/lib/brand";

type Props = {
  formId: string | undefined;
  title: string;
  minHeight?: number;
};

export function TallyEmbed({ formId, title, minHeight = 600 }: Props) {
  const ref = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!formId) return;
    if (typeof window === "undefined") return;
    if (document.querySelector('script[src="https://tally.so/widgets/embed.js"]')) return;
    const s = document.createElement("script");
    s.src = "https://tally.so/widgets/embed.js";
    s.async = true;
    document.body.appendChild(s);
  }, [formId]);

  if (!formId) {
    return (
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-10 text-center">
        <div className="text-[color:var(--muted)] text-sm">
          Form not connected yet.
        </div>
        <p className="mt-3 text-[color:var(--foreground)]">
          Write us at{" "}
          <a
            href={`mailto:${brand.contactEmail}`}
            className="text-[color:var(--primary)] hover:underline"
          >
            {brand.contactEmail}
          </a>
          .
        </p>
      </div>
    );
  }

  const src = `https://tally.so/embed/${formId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`;

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] overflow-hidden">
      <iframe
        ref={ref}
        data-tally-src={src}
        src={src}
        loading="lazy"
        width="100%"
        height={minHeight}
        title={title}
        className="w-full block"
        style={{ border: 0 }}
      />
    </div>
  );
}
