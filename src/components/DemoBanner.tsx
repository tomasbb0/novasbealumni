import { brand } from "@/lib/brand";

export function DemoBanner() {
  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-[60] max-w-[14rem]">
      <div
        title={`A weekend experiment by an alum. Not affiliated with ${brand.school}.`}
        className="pointer-events-auto select-none rounded-2xl bg-white/85 backdrop-blur border border-[color:var(--border)] px-3 py-2 text-[11px] leading-snug text-[color:var(--muted)] shadow-sm"
      >
        a weekend experiment by an alum. probably broken in places. definitely not affiliated with the school.
      </div>
    </div>
  );
}
