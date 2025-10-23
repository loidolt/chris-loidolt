import type { Config } from "@react-router/dev/config";

export default {
  // Server-side render by default
  ssr: true,

  // Use Cloudflare Workers preset
  buildDirectory: "./build",

  // Cloudflare Pages configuration
  serverBuildFile: "index.js",
} satisfies Config;
