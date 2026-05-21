import type { Metadata } from "next";
import { Playfair_Display, Open_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { brand } from "@/lib/brand";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { DemoBanner } from "@/components/DemoBanner";
import { AuthProvider } from "@/lib/auth";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://novasbealumni.com"),
  title: { default: brand.name, template: `%s · ${brand.name}` },
  description: brand.description,
  openGraph: {
    title: brand.name,
    description: brand.description,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${openSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        <div
          aria-hidden
          className="pointer-events-none fixed top-14 inset-x-0 bottom-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_rgba(226,119,63,0.18),_transparent_60%),radial-gradient(ellipse_at_top_right,_rgba(3,63,133,0.16),_transparent_55%),radial-gradient(ellipse_at_bottom_center,_rgba(251,233,218,0.7),_transparent_70%)]"
        />
        <AuthProvider>
          <DemoBanner />
          <SiteNav />
          <main className="flex-1 flex flex-col">{children}</main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
