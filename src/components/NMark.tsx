type Props = { size?: number; className?: string; color?: string };

export function NMark({ size = 28, className, color = "currentColor" }: Props) {
  // Original geometric "N" mark. Two stems + diagonal, drawn from a single path.
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 4 H13 L27 26 V4 H36 V36 H27 L13 14 V36 H4 Z"
        fill={color}
      />
    </svg>
  );
}
