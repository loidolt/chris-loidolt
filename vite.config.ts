import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";
import tailwindcss from "@tailwindcss/vite";
import dotenv from "dotenv";

// Load .env.local file into process.env (falls back to .env if not found)
dotenv.config({ path: ".env.local" });
dotenv.config(); // Also load .env as fallback

export default defineConfig({
  optimizeDeps: {
    exclude: ['leaflet', 'leaflet-draw', 'leaflet.markercluster'],
  },
  ssr: {
    // Don't bundle Leaflet for SSR - it requires browser window object
    external: ['leaflet', 'leaflet-draw', 'leaflet.markercluster'],
  },
  plugins: [
    tailwindcss(),
    sveltekit(),
    SvelteKitPWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      scope: "/",
      base: "/",
      manifest: {
        short_name: "Loidolt Spaces",
        name: "Loidolt Spaces",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#0d1117",
        background_color: "#0d1117",
        description: "Multi-tenant family portfolio system",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        categories: ["portfolio", "education", "productivity"],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: "module",
        navigateFallback: "/",
      },
    }),
  ],
  server: {
    port: 3050,
    host: true, // Listen on all network interfaces (needed for Docker)
    watch: {
      usePolling: true, // Needed for Docker volume mounts
    },
    fs: {
      allow: [".."],
    },
  },
});
