#!/usr/bin/env node
/**
 * Generate PWA icons from a source SVG
 * This creates proper PNG icons at multiple sizes for PWA support
 */

import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';

const sizes = [192, 512];
const sourceIconPath = path.join(process.cwd(), 'static', 'icon.svg');
const outputDir = path.join(process.cwd(), 'static');

async function generateIcons() {
  console.log('🎨 Generating PWA icons...');

  // For now, create simple colored squares as icons
  // In a real app, you'd use the SVG or have a designer create proper icons
  for (const size of sizes) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Create a gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#0d1117');
    gradient.addColorStop(1, '#1f2937');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Add a simple "L" letter in the center
    ctx.fillStyle = '#10b981';
    ctx.font = `bold ${size * 0.6}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('L', size / 2, size / 2);

    // Save the icon
    const outputPath = path.join(outputDir, `icon-${size}.png`);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log(`✓ Generated ${outputPath}`);
  }

  // Generate favicon
  const canvas = createCanvas(32, 32);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 32, 32);
  gradient.addColorStop(0, '#0d1117');
  gradient.addColorStop(1, '#1f2937');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('L', 16, 16);

  const faviconPath = path.join(outputDir, 'favicon.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(faviconPath, buffer);
  console.log(`✓ Generated ${faviconPath}`);

  console.log('✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
