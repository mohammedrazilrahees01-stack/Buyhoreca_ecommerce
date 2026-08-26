import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#00a879" };

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://buyhoreca.com"),
  title: { default: "BuyHoreca | Professional HoReCa Equipment & Supplies", template: "%s | BuyHoreca" },
  description: "Professional HoReCa equipment and supplies for hospitality, kitchens, coffee, bakery, hotel, service and foodservice operations in the UAE.",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: { type: "website", siteName: "BuyHoreca", images: ["/images/hero/hero-main.jpg"], title: "BuyHoreca | Professional HoReCa Equipment & Supplies", description: "Professional HoReCa equipment and supplies for hospitality and foodservice operations in the UAE.", url: "https://buyhoreca.com" },
  alternates: { canonical: "/" },
  manifest: "/site.webmanifest",
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
  keywords: ["HoReCa equipment UAE","restaurant equipment Dubai","commercial kitchen equipment UAE","hotel supplies UAE","coffee equipment UAE","bakery equipment UAE","BuyHoreca"],
  twitter: { card: "summary_large_image", title: "BuyHoreca | Professional HoReCa Equipment & Supplies", description: "Professional HoReCa equipment and supplies for hospitality and foodservice operations in the UAE.", images: ["/images/hero/hero-main.jpg"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
