type Variant = "wordmark" | "circle" | "n";

type Props = {
  variant?: Variant;
  className?: string;
  alt?: string;
  height?: number;
  width?: number;
};

const SRC: Record<Variant, string> = {
  wordmark: "/brand/novasbe-wordmark.svg",
  circle: "/brand/novasbe-circle.svg",
  n: "/brand/novasbe-N.svg",
};

const DEFAULT_ALT: Record<Variant, string> = {
  wordmark: "Nova SBE",
  circle: "Nova SBE",
  n: "Nova SBE",
};

export function NovaSBEMark({ variant = "wordmark", className, alt, height, width }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SRC[variant]}
      alt={alt ?? DEFAULT_ALT[variant]}
      className={className}
      height={height}
      width={width}
      draggable={false}
    />
  );
}
