import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BuyHoreca",
    short_name: "BuyHoreca",
    description: "Professional HoReCa equipment and supplies.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#008f68",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" }],
  };
}
