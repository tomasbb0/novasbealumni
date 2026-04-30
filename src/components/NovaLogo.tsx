"use client";

import { useState } from "react";
import { NovaCircleDash } from "./NovaCircleDash";

type Props = {
  /** Height of the N/V/A letters in px. Everything else scales from this. */
  size?: number;
  /** Show the small "novasbe" wordmark to the right of NOVA. */
  showSignature?: boolean;
  /** Play the on-load reveal animation. */
  animate?: boolean;
  className?: string;
};

// Faithful reproduction of the Nova SBE composite top-left logo:
// N + (circle with dash underneath = the "O") + V + A   [optional novasbe wordmark]
// Geometry and animations mirror nova-logo on novasbe.unl.pt.
export function NovaLogo({
  size = 28,
  showSignature = true,
  animate = true,
  className,
}: Props) {
  const [animClass] = useState(animate ? "nova-logo-animate" : "");
  const circle = Math.round(size * 0.93); // O diameter relative to letter height
  const sigH = Math.max(12, Math.round(size * 0.64));
  const dashFinalWidth = circle * 2.97;
  const dashStartScale = 0.42; // dash width at moment of landing
  const dashEndScale = 1.25;   // dash extends past base width
  const ballStartX = -Math.round((dashFinalWidth * (1 - dashStartScale)) / 2);
  const ballEndX = Math.round((dashFinalWidth * (dashEndScale - 1)) / 2);
  const ballLiftY = -Math.round(size * 0.12); // ball rises slightly as dash grows
  const vaStart = -Math.round(dashFinalWidth * (1 - dashStartScale));
  const vaEnd = Math.round(dashFinalWidth * (dashEndScale - 1));
  const fallDistance = Math.round(size * 2.5);

  return (
    <span
      className={`inline-flex items-end gap-0 ${animClass} ${className ?? ""}`}
      style={
        {
          lineHeight: 0,
          ["--nl-va-start" as string]: `${vaStart}px`,
          ["--nl-va-end" as string]: `${vaEnd}px`,
          ["--nl-ball-start-x" as string]: `${ballStartX}px`,
          ["--nl-ball-end-x" as string]: `${ballEndX}px`,
          ["--nl-ball-lift-y" as string]: `${ballLiftY}px`,
          ["--nl-fall" as string]: `${fallDistance}px`,
          ["--nl-dash-start" as string]: `${dashStartScale}`,
          ["--nl-dash-end" as string]: `${dashEndScale}`,
        } as React.CSSProperties
      }
      aria-label="Nova SBE Alumni"
    >
      <span className="nl-N" style={{ display: "inline-block", marginRight: size * 0.22 }}>
        <img src="/brand/novasbe-N.svg" alt="" height={size} style={{ height: size, width: "auto", display: "block" }} />
      </span>

      <span className="nl-group" style={{ display: "inline-block" }}>
        <NovaCircleDash size={circle} color="currentColor" />
      </span>

      <span className="nl-va" style={{ display: "inline-flex", alignItems: "flex-end" }}>
        <span className="nl-V" style={{ display: "inline-block", marginLeft: size * 0.05 }}>
          <img src="/brand/novasbe-V.svg" alt="" height={size} style={{ height: size, width: "auto", display: "block" }} />
        </span>

        <span className="nl-A" style={{ display: "inline-block", marginLeft: -size * 0.18, marginRight: size * 0.22 }}>
          <img src="/brand/novasbe-A.svg" alt="" height={size} style={{ height: size, width: "auto", display: "block" }} />
        </span>
      </span>

      {showSignature && (
        <span
          className="nl-sig"
          style={{ display: "inline-block", alignSelf: "flex-end", paddingBottom: size * 0.05 }}
        >
          <img
            src="/brand/novasbe-wordmark.svg"
            alt=""
            height={sigH}
            style={{ height: sigH, width: "auto", display: "block" }}
          />
        </span>
      )}

      <style jsx global>{`
        @keyframes nlFall {
          0%   { transform: translateY(calc(var(--nl-fall) * -1)); }
          100% { transform: translateY(0); }
        }
        @keyframes nlBallSlide {
          0%   { transform: translate(var(--nl-ball-start-x), 0); }
          100% { transform: translate(var(--nl-ball-end-x), var(--nl-ball-lift-y)); }
        }
        @keyframes nlDashGrow {
          0%   { transform: scaleX(var(--nl-dash-start)); }
          100% { transform: scaleX(var(--nl-dash-end)); }
        }
        @keyframes nlVADrag {
          0%   { transform: translateX(var(--nl-va-start)); }
          100% { transform: translateX(var(--nl-va-end)); }
        }
        @keyframes nlSig { 0% { opacity: 0; } 100% { opacity: 1; } }

        /* Phase 1 (0-0.6s): ball+dash unit falls together from above. */
        .nova-logo-animate .nl-group {
          animation: nlFall 0.6s cubic-bezier(.45,.05,.6,1) 0s 1 forwards;
        }
        /* Ball starts compressed (below resting), then rises to natural top-of-dash position once. */
        .nova-logo-animate .nl-cd-circle {
          transform: translate(var(--nl-ball-start-x), 0);
          animation: nlBallSlide 0.9s cubic-bezier(.3,.6,.4,1) 0.6s 1 forwards;
        }
        /* Dash grows rightward, past its base width, in sync with the ball. */
        .nova-logo-animate .nl-cd-dash {
          transform-origin: left center;
          transform: scaleX(var(--nl-dash-start));
          animation: nlDashGrow 0.9s cubic-bezier(.3,.6,.4,1) 0.6s 1 forwards;
        }
        /* V+A get dragged right as the dash extends past base width. */
        .nova-logo-animate .nl-va {
          transform: translateX(var(--nl-va-start));
          animation: nlVADrag 0.9s cubic-bezier(.3,.6,.4,1) 0.6s 1 forwards;
        }
        .nova-logo-animate .nl-sig {
          opacity: 0;
          animation: nlSig 0.6s ease-in 1.5s forwards;
        }
      `}</style>
    </span>
  );
}
