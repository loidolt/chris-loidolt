import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable experimental features for edge runtime
  experimental: {
    // Optimize for Cloudflare Workers
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // External packages that should not be bundled for server-side
  serverExternalPackages: ['three'],

  // Webpack configuration for Cloudflare Workers compatibility
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize three.js on server to avoid bundling issues
      config.externals = [...(config.externals || []), 'three'];
    }

    // Handle canvas (used by some visualization libraries)
    config.resolve.alias.canvas = false;

    return config;
  },

  // Image optimization (note: Cloudflare Workers has limitations)
  images: {
    // Use default loader - images from Airtable
    unoptimized: true, // Required for Cloudflare Workers static export
  },

  // Enable React strict mode
  reactStrictMode: true,

  // Turbopack configuration (Next.js 16 default)
  turbopack: {
    // Empty config to silence webpack compatibility warning
    // Webpack config above is kept for compatibility
  },
};

export default nextConfig;
