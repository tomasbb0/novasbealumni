type Props = {
  className?: string;
  color?: string;
  strokeWidth?: number;
};

// A thick black ring with a short underscore dash beneath it.
// Echoes the Nova SBE circle mark but drops the wordmark inside.
export function RingDash({ className, color = "currentColor", strokeWidth = 12 }: Props) {
  const r = 50 - strokeWidth / 2;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 124"
      className={className}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth={strokeWidth} />
      <line
        x1="32"
        x2="68"
        y1="116"
        y2="116"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}
