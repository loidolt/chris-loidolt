import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static exports
  output: 'standalone',
  
  // Image optimization
  images: {
    domains: ['github.com', 'raw.githubusercontent.com', 'user-images.githubusercontent.com'],
  },
  
  // Cache control headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
  
  // Removed experimental PPR as it requires canary version
};

export default nextConfig;
