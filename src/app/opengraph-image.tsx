import { ImageResponse } from "next/og";
import { brand } from "@/lib/brand";

export const runtime = "edge";
export const alt = brand.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0b0b0d",
          color: "#f5f5f4",
          padding: 80,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, color: "#a8a29e", letterSpacing: 4, textTransform: "uppercase" }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#c8a25b" }} />
          {brand.schoolShort} · {brand.city}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 84, lineHeight: 1.05, fontWeight: 600, letterSpacing: -2, maxWidth: 980 }}>
            The Nova SBE alumni community in <span style={{ color: "#c8a25b" }}>New York</span>.
          </div>
          <div style={{ fontSize: 28, color: "#a8a29e", maxWidth: 880 }}>
            {brand.description}
          </div>
        </div>
        <div style={{ fontSize: 24, color: "#c8a25b", fontWeight: 500 }}>
          {brand.name}
        </div>
      </div>
    ),
    size
  );
}
