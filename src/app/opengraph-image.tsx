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
          background: "#ffffff",
          color: "#212529",
          padding: 80,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "Georgia, serif",
          backgroundImage:
            "radial-gradient(ellipse at top left, rgba(84,28,101,0.18), transparent 55%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, color: "#541C65", letterSpacing: 4, textTransform: "uppercase", fontFamily: "system-ui, sans-serif", fontWeight: 600 }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#ED1B34" }} />
          {brand.schoolShort} · {brand.city}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 88, lineHeight: 1.05, fontWeight: 600, letterSpacing: -2, maxWidth: 980 }}>
            The Nova SBE alumni community in <span style={{ color: "#541C65" }}>New York</span>.
          </div>
          <div style={{ fontSize: 28, color: "#6c757d", maxWidth: 880, fontFamily: "system-ui, sans-serif" }}>
            {brand.description}
          </div>
        </div>
        <div style={{ fontSize: 24, color: "#541C65", fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>
          {brand.name}
        </div>
      </div>
    ),
    size
  );
}
