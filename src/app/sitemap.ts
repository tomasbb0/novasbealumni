import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://novaalumni.nyc";
  const now = new Date();
  return ["", "/rsvp", "/survey"].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
  }));
}
