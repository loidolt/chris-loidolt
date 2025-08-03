import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Enable static export
  experimental: {
    // Ensure proper static generation
    typedRoutes: true,
  },
};

export default nextConfig;
