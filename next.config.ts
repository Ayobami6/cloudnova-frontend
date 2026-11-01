import type { NextConfig } from "next";

const BACKEND_URL =
  process.env.INTERNAL_API_URL || "http://cloudnova-api.cloudnova.svc.cluster.local:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
