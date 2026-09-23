import type { NextConfig } from "next";

const BACKEND_URL =
  process.env.INTERNAL_API_URL ||
  "http://k8s-cloudnov-cloudnov-6ebe25da57-2123963134.us-east-1.elb.amazonaws.com";

const nextConfig: NextConfig = {
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

