import type { ReactNode } from "react";
import type { Metadata } from "next";
import Script from "next/script";
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
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined },
  twitter: { card: "summary_large_image", title: "BuyHoreca | Professional HoReCa Equipment & Supplies", description: "Professional hospitality equipment and supplies for hotels, restaurants, cafés, catering and foodservice operations.", images: ["/og-image.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const gaId = process.env.NEXT_PUBLIC_GA4_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const organizationSchema = {"@context":"https://schema.org","@type":"Organization","name":"BuyHoreca Trading Co. LLC","url":"https://buyhoreca.com","logo":"https://buyhoreca.com/images/buyhoreca-logo-header.png"};
  return <html lang="en">
    <body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organizationSchema)}}/>
      {gaId && <><Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive"/><Script id="ga4-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}</Script></>}
      {metaPixelId && <Script id="meta-pixel-init" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}</Script>}
    </body>
  </html>;
}
