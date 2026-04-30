type Props = {
  size?: number;
  className?: string;
  color?: string;
  variant?: "ring" | "n" | "badge";
};

// "ring": just the heavy black circle outline (Nova SBE "on" badge style)
// "n":    the Nova N glyph alone
// "badge": N glyph centered inside the heavy ring
export function NMark({
  size = 28,
  className,
  color = "currentColor",
  variant = "badge",
}: Props) {
  const stroke = 8;

  if (variant === "ring") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={className}
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r={50 - stroke / 2}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
        />
      </svg>
    );
  }

  if (variant === "n") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 37.19 37.52"
        width={size}
        height={size}
        className={className}
        aria-hidden="true"
      >
        <path
          fill={color}
          d="M27.5 0v22.02L9.69 0H0v37.52h9.69V15.5l17.81 22.02h9.69V0z"
        />
      </svg>
    );
  }

  // badge: ring + N inside
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r={50 - stroke / 2}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
      />
      <g transform="translate(31 31) scale(1.02)">
        <path
          fill={color}
          d="M27.5 0v22.02L9.69 0H0v37.52h9.69V15.5l17.81 22.02h9.69V0z"
        />
      </g>
    </svg>
  );
}
