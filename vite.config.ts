import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import tailwindcss from '@tailwindcss/vite';
import dotenv from 'dotenv';

// Load .env.local file into process.env (falls back to .env if not found)
dotenv.config({ path: '.env.local' });
dotenv.config(); // Also load .env as fallback

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    SvelteKitPWA({
      srcDir: './src',
      mode: 'production',
      strategies: 'injectManifest',
      filename: 'prompt-sw.ts',
      registerType: 'autoUpdate',
      scope: '/',
      base: '/',
      manifest: {
        short_name: 'Portfolio',
        name: 'Chris Loidolt Portfolio',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#0d1117',
        background_color: '#0d1117',
        description: 'Multi-tenant family portfolio system',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}']
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  server: {
    port: 3050,
    fs: {
      allow: ['..']
    }
  }
});
