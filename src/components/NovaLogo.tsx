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
  const dashStartScale = 0.32;
  const vaShrink = Math.round(dashFinalWidth * (1 - dashStartScale));
  const ballShiftX = Math.round((dashFinalWidth * (1 - dashStartScale)) / 2);
  const fallDistance = Math.round(size * 2.5);
  const compress = Math.round(size * 0.5);

  return (
    <span
      className={`inline-flex items-end gap-0 ${animClass} ${className ?? ""}`}
      style={
        {
          lineHeight: 0,
          ["--nl-va-shrink" as string]: `${vaShrink}px`,
          ["--nl-ball-x" as string]: `${ballShiftX}px`,
          ["--nl-fall" as string]: `${fallDistance}px`,
          ["--nl-compress" as string]: `${compress}px`,
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
          0%   { transform: translateX(calc(var(--nl-ball-x) * -1)); }
          100% { transform: translateX(0); }
        }
        @keyframes nlDashGrow {
          0%   { transform: scaleX(0.32); }
          100% { transform: scaleX(1); }
        }
        @keyframes nlVADrag {
          0%   { transform: translateX(calc(var(--nl-va-shrink) * -1)); }
          100% { transform: translateX(0); }
        }
        @keyframes nlSig { 0% { opacity: 0; } 100% { opacity: 1; } }

        /* Phase 1 (0-0.6s): ball+dash unit falls together from above. */
        .nova-logo-animate .nl-group {
          animation: nlFall 0.6s cubic-bezier(.45,.05,.6,1) 0s 1 forwards;
        }
        /* Ball starts compressed (below resting), then rises to natural top-of-dash position once. */
        .nova-logo-animate .nl-cd-circle {
          transform: translateX(calc(var(--nl-ball-x) * -1));
          animation: nlBallSlide 0.9s cubic-bezier(.3,.6,.4,1) 0.6s 1 forwards;
        }
        /* Dash grows rightward in sync with the ball rising. */
        .nova-logo-animate .nl-cd-dash {
          transform-origin: left center;
          transform: scaleX(0.32);
          animation: nlDashGrow 0.9s cubic-bezier(.3,.6,.4,1) 0.6s 1 forwards;
        }
        /* V+A get dragged right as the dash extends. */
        .nova-logo-animate .nl-va {
          transform: translateX(calc(var(--nl-va-shrink) * -1));
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
