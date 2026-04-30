import { brand } from "@/lib/brand";

export function DemoBanner() {
  return (
    <div className="relative z-[60] bg-amber-100 text-amber-950 border-b border-amber-300/70">
      <div className="mx-auto max-w-6xl px-6 py-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] sm:text-xs uppercase tracking-widest text-center">
        <span className="font-semibold">Unofficial concept</span>
        <span aria-hidden="true" className="opacity-50">·</span>
        <span>Built by an alum</span>
        <span aria-hidden="true" className="opacity-50">·</span>
        <span>
          Not affiliated with {brand.school}
        </span>
      </div>
    </div>
  );
}
