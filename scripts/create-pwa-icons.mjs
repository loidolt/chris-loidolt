#!/usr/bin/env node
/**
 * Generate PWA icons
 * Creates proper PNG icons from SVG using sharp
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staticDir = path.join(__dirname, '..', 'static');

const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d1117;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1f2937;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#grad)" />
  <text x="256" y="340" font-family="system-ui, -apple-system, sans-serif"
        font-size="320" font-weight="bold" fill="#10b981" text-anchor="middle">L</text>
</svg>
`;

async function generateIcons() {
  console.log('🎨 Generating PWA icons...');

  const sizes = [192, 512];

  for (const size of sizes) {
    const outputPath = path.join(staticDir, `icon-${size}.png`);
    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`✓ Generated icon-${size}.png`);
  }

  // Generate favicon
  const faviconPath = path.join(staticDir, 'favicon.png');
  await sharp(Buffer.from(svgIcon))
    .resize(32, 32)
    .png()
    .toFile(faviconPath);
  console.log(`✓ Generated favicon.png`);

  console.log('✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
