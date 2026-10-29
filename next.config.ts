import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.lightfunnels.com",
        pathname: "/**",
      },
    ],
  },

  /**
   * kmpn.agency is the canonical host (it is also the `metadataBase` in
   * app/layout.tsx). Without this, both hosts served the same pages and
   * search engines saw every page twice.
   */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.kmpn.agency" }],
        destination: "https://kmpn.agency/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
