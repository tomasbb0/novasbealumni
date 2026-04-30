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
        @keyframes nlDrop {
          0%   { transform: translate3d(0, -70px, 0); }
          40%  { transform: translate3d(0, 0, 0); }
          55%  { transform: translate3d(0, -28%, 0); }
          70%  { transform: translate3d(0, 0, 0); }
          82%  { transform: translate3d(0, -10%, 0); }
          92%  { transform: translate3d(0, 0, 0); }
          97%  { transform: translate3d(0, -3%, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        @keyframes nlDash {
          0%,40% { transform: scaleX(0.42); }
          70%    { transform: scaleX(0.78); }
          92%    { transform: scaleX(0.96); }
          100%   { transform: scaleX(1); }
        }
        @keyframes nlSig { 0% { opacity: 0; } 100% { opacity: 1; } }

        .nova-logo-animate .nl-cd-circle {
          animation: nlDrop 2.4s cubic-bezier(.55,.08,.4,1) 0s 1 forwards;
        }
        .nova-logo-animate .nl-cd-dash {
          transform: scaleX(0.42);
          animation: nlDash 2.4s cubic-bezier(.4,.1,.3,1) 0s 1 forwards;
        }
        .nova-logo-animate .nl-sig {
          opacity: 0;
          animation: nlSig 0.7s ease-in 1.6s forwards;
        }
      `}</style>
    </span>
  );
}
