import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://buyhoreca.com"),
  title: { default: "BuyHoreca | Professional HoReCa Equipment & Supplies", template: "%s | BuyHoreca" },
  description: "Professional HoReCa equipment and supplies for hospitality, kitchens, coffee, bakery, hotel, service and foodservice operations in the UAE.",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: { type: "website", siteName: "BuyHoreca", images: ["/images/hero/hero-main.jpg"], title: "BuyHoreca | Professional HoReCa Equipment & Supplies", description: "Professional HoReCa equipment and supplies for hospitality and foodservice operations in the UAE.", url: "https://buyhoreca.com" },
  twitter: { card: "summary_large_image", title: "BuyHoreca | Professional HoReCa Equipment & Supplies", description: "Professional HoReCa equipment and supplies for hospitality and foodservice operations in the UAE." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
