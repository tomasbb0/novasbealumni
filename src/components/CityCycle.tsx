"use client";

import { useEffect, useState } from "react";

const CITIES = [
  "New York",
  "Lisbon",
  "London",
  "Amsterdam",
  "Hong Kong",
  "Singapore",
  "Paris",
  "Dubai",
  "Berlin",
  "Zurich",
  "Tokyo",
  "São Paulo",
  "Madrid",
  "Sydney",
];

const TYPE_MS = 80;
const ERASE_MS = 45;
const HOLD_MS = 1400;
const PRE_TYPE_MS = 350;

type Phase = "typing" | "holding" | "erasing" | "waiting";

export function CityCycle({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");

  useEffect(() => {
    const word = CITIES[index];
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (text.length < word.length) {
        timeout = setTimeout(() => setText(word.slice(0, text.length + 1)), TYPE_MS);
      } else {
        timeout = setTimeout(() => setPhase("holding"), 0);
      }
    } else if (phase === "holding") {
      timeout = setTimeout(() => setPhase("erasing"), HOLD_MS);
    } else if (phase === "erasing") {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(word.slice(0, text.length - 1)), ERASE_MS);
      } else {
        timeout = setTimeout(() => setPhase("waiting"), 0);
      }
    } else if (phase === "waiting") {
      timeout = setTimeout(() => {
        setIndex((i) => (i + 1) % CITIES.length);
        setPhase("typing");
      }, PRE_TYPE_MS);
    }

    return () => clearTimeout(timeout);
  }, [text, phase, index]);

  return (
    <span className={className}>
      <span aria-live="polite">{text}</span>
      <span
        aria-hidden="true"
        className="inline-block w-[2px] -mb-1 ml-0.5 h-[0.85em] bg-current align-baseline animate-pulse"
      />
    </span>
  );
}
