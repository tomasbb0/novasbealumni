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

  return (
    <span
      className={`inline-flex items-end gap-0 ${animClass} ${className ?? ""}`}
      style={{ lineHeight: 0 }}
      aria-label="Nova SBE Alumni"
    >
      <span className="nl-N" style={{ display: "inline-block", marginRight: size * 0.22 }}>
        <img src="/brand/novasbe-N.svg" alt="" height={size} style={{ height: size, width: "auto", display: "block" }} />
      </span>

      <span className="nl-group" style={{ display: "inline-block" }}>
        <span className="nl-circle" style={{ display: "inline-block" }}>
          <NovaCircleDash size={circle} color="currentColor" />
        </span>
      </span>

      <span className="nl-V" style={{ display: "inline-block", marginLeft: size * 0.05 }}>
        <img src="/brand/novasbe-V.svg" alt="" height={size} style={{ height: size, width: "auto", display: "block" }} />
      </span>

      <span className="nl-A" style={{ display: "inline-block", marginLeft: -size * 0.18, marginRight: size * 0.22 }}>
        <img src="/brand/novasbe-A.svg" alt="" height={size} style={{ height: size, width: "auto", display: "block" }} />
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
        @keyframes nlN { 0%,5%,6%,10%,11%,15% { opacity: 0; } 16%,20% { opacity: 1; } 21%,25% { opacity: 0; } 26%,100% { opacity: 1; } }
        @keyframes nlCircle { 0% { transform: translate3d(0,-70px,0); opacity: 1; } 30% { transform: translate3d(0,0,0); } 31%,100% { opacity: 1; } }
        @keyframes nlV { 0%,5% { opacity: 0; } 6%,10%,11%,15% { opacity: 1; } 16%,20%,21%,25%,26%,30% { opacity: 0; } 31%,100% { opacity: 1; } }
        @keyframes nlA { 0%,5% { opacity: 1; } 6%,10% { opacity: 0; } 11%,15% { opacity: 1; } 16%,20% { opacity: 0; } 21%,25%,26%,100% { opacity: 1; } }
        @keyframes nlSig { 0% { opacity: 0; } 100% { opacity: 1; } }
        .nova-logo-animate .nl-N,
        .nova-logo-animate .nl-V,
        .nova-logo-animate .nl-A,
        .nova-logo-animate .nl-circle {
          opacity: 0;
          animation-iteration-count: 1;
          animation-direction: normal;
          animation-timing-function: ease-in;
          animation-fill-mode: forwards;
          animation-duration: 6s;
        }
        .nova-logo-animate .nl-N { animation-name: nlN; }
        .nova-logo-animate .nl-circle { animation-name: nlCircle; }
        .nova-logo-animate .nl-V { animation-name: nlV; }
        .nova-logo-animate .nl-A { animation-name: nlA; }
        .nova-logo-animate .nl-sig {
          opacity: 0;
          animation: nlSig 0.7s ease-in 1s forwards;
        }
      `}</style>
    </span>
  );
}
