import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
  ],
  output: 'static', // Static site generation for low-power deployment
  server: {
    port: 4321,
    host: true,
  },
  vite: {
    plugins: [tailwindcss()], // Tailwind v4 via Vite plugin
    ssr: {
      noExternal: ['three'],
    },
  },
});
