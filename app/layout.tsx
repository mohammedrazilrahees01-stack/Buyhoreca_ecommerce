import type { Metadata } from "next";
import "./globals.css";

export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#008f68" };

export const metadata: Metadata = {
  metadataBase: new URL("https://buyhoreca.com"),
  title: {
    default: "BuyHoreca | Professional HoReCa Equipment & Supplies",
    template: "%s | BuyHoreca",
  },
  description: "Professional HoReCa equipment and supplies for hospitality, kitchens, coffee, bakery, hotel, service and foodservice operations.",
  applicationName: "BuyHoreca",
  keywords: ["HoReCa equipment", "hotel supplies", "restaurant supplies", "commercial kitchen equipment", "hospitality supplies", "UAE foodservice"],
  alternates: { canonical: "https://buyhoreca.com" },
  openGraph: {
    title: "BuyHoreca | Professional HoReCa Equipment & Supplies",
    description: "Professional hospitality equipment and supplies from the BuyHoreca catalogue.",
    url: "https://buyhoreca.com",
    siteName: "BuyHoreca",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "BuyHoreca — Professional HoReCa Equipment & Supplies" }],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  twitter: { card: "summary_large_image", title: "BuyHoreca | Professional HoReCa Equipment & Supplies", description: "Professional hospitality equipment and supplies for hotels, restaurants, cafés, catering and foodservice operations.", images: ["/og-image.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
