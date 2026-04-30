type Props = {
  /** Diameter of the circle in px. The dash + spacing scale from this. */
  size?: number;
  /** Scale the dash thickness (1.0 = original Nova SBE proportions). */
  dashScale?: number;
  className?: string;
  color?: string;
};

// The Nova SBE "O" mark: circle ring sitting on top of a thick horizontal bar.
// Mirrors .nova-logo--group + .nova-logo--circle from novasbe.unl.pt.
export function NovaCircleDash({ size = 36, dashScale = 0.7, className, color = "currentColor" }: Props) {
  const groupWidth = size * 2.97; // 6.5rem when circle is 35px
  const dash = Math.max(2, Math.round(size * 0.46 * dashScale));
  const padBottom = Math.max(1, Math.round(size * 0.18));

  return (
    <span
      className={`nl-cd ${className ?? ""}`}
      style={{
        display: "inline-block",
        position: "relative",
        width: groupWidth,
        verticalAlign: "bottom",
        lineHeight: 0,
      }}
    >
      <span style={{ display: "block", paddingBottom: padBottom + dash }}>
        <img
          className="nl-cd-circle"
          src="/brand/novasbe-circle.svg"
          alt=""
          width={size}
          height={size}
          style={{ display: "block", margin: "0 auto", width: size, height: size }}
        />
      </span>
      <span
        className="nl-cd-dash"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: dash,
          background: color,
          transformOrigin: "center",
        }}
      />
    </span>
  );
}
