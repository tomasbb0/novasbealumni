type Props = {
  /** Diameter of the circle in px. The dash + spacing scale from this. */
  size?: number;
  className?: string;
  color?: string;
};

// The Nova SBE "O" mark: circle ring sitting on top of a thick horizontal bar.
// Mirrors .nova-logo--group + .nova-logo--circle from novasbe.unl.pt.
export function NovaCircleDash({ size = 36, className, color = "currentColor" }: Props) {
  const groupWidth = size * 2.97; // 6.5rem when circle is 35px
  const dash = Math.max(2, Math.round(size * 0.46)); // 16px when circle is 35px
  const padBottom = Math.max(1, Math.round(size * 0.18));

  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        width: groupWidth,
        borderBottom: `${dash}px solid ${color}`,
        verticalAlign: "bottom",
        lineHeight: 0,
      }}
    >
      <span
        style={{
          display: "block",
          paddingBottom: padBottom,
        }}
      >
        <img
          src="/brand/novasbe-circle.svg"
          alt=""
          width={size}
          height={size}
          style={{ display: "block", margin: "0 auto", width: size, height: size }}
        />
      </span>
    </span>
  );
}
