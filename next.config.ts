import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cms.radicubs.com", pathname: "/uploads/**" }
    ]
  },
  webpack(config) {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    return config;
  }
};

export default nextConfig;
