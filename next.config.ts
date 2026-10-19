import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  poweredByHeader: false,
  experimental: { optimizePackageImports: ["lucide-react"] },
  async rewrites() {
    // Run this proxy before the catch-all storefront route; Track123 targets the current
    // origin on localhost and expects its /endApi requests to reach the provider.
    return {
      beforeFiles: [
        {
          source: "/endApi/api/store/anonymous/:path*",
          destination: "https://shp.track123.com/endApi/api/store/anonymous/:path*",
        },
        {
          source: "/endApi/api/store/get-tracking-page-translation-config",
          destination: "https://shp.track123.com/endApi/api/store/get-tracking-page-translation-config",
        },
        {
          source: "/tracking-page-spa/:path*",
          destination: "https://shp.track123.com/tracking-page-spa/:path*",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
};
export default nextConfig;
