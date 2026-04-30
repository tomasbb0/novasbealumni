import { brand } from "@/lib/brand";

export function DemoBanner() {
  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-[60]">
      <div
        title={`Unofficial alumni concept. Not affiliated with ${brand.school}.`}
        className="pointer-events-auto select-none rounded-full bg-white/80 backdrop-blur border border-[color:var(--border)] px-2.5 py-1 text-[10px] tracking-wide text-[color:var(--muted)] shadow-sm"
      >
        unofficial concept
      </div>
    </div>
  );
}
