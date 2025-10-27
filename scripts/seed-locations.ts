#!/usr/bin/env tsx

/**
 * Seed sample location data into PocketBase
 *
 * This script creates sample locations for testing the GIS map feature.
 * Locations include both public and private examples with various categories.
 *
 * Prerequisites:
 * - PocketBase must be running (default: http://127.0.0.1:8090)
 * - Locations collection must be created in PocketBase
 *
 * Usage: npm run seed:locations
 */

import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Helper to get environment variable
function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

// Generate a random share token
function generateShareToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Sample locations data
const SAMPLE_LOCATIONS = [
  {
    name: 'Garden of the Gods',
    description: 'A public park with stunning red rock formations in Colorado Springs. Popular destination for hiking, rock climbing, and photography.',
    latitude: 38.8719,
    longitude: -104.8862,
    categories: ['Nature', 'Recreation', 'Photography'],
    status: 'Published',
    privacy: 'Public',
    url: 'https://gardenofgods.com',
  },
  {
    name: 'Pikes Peak Summit',
    description: "America's Mountain - one of Colorado's famous 14ers. Drive or hike to the 14,115 ft summit for breathtaking views.",
    latitude: 38.8409,
    longitude: -105.0423,
    categories: ['Nature', 'Hiking', 'Scenic'],
    status: 'Published',
    privacy: 'Public',
    url: 'https://www.pikespeak.us.com',
  },
  {
    name: 'United States Air Force Academy',
    description: 'Home to the iconic Cadet Chapel and beautiful campus. Visitor center open to the public.',
    latitude: 38.9947,
    longitude: -104.8619,
    categories: ['Education', 'Architecture', 'Tourism'],
    status: 'Published',
    privacy: 'Public',
    url: 'https://www.usafa.edu',
  },
  {
    name: 'Manitou Springs',
    description: 'Historic mountain town known for its natural mineral springs, quirky shops, and artistic community.',
    latitude: 38.8572,
    longitude: -104.9192,
    categories: ['Tourism', 'Shopping', 'Historic'],
    status: 'Published',
    privacy: 'Public',
    url: 'https://manitousprings.org',
  },
  {
    name: 'Cheyenne Mountain Zoo',
    description: "America's only mountain zoo. Home to over 750 animals and famous for giraffe feedings.",
    latitude: 38.7706,
    longitude: -104.8525,
    categories: ['Tourism', 'Family', 'Wildlife'],
    status: 'Published',
    privacy: 'Public',
    url: 'https://www.cmzoo.org',
  },
  {
    name: 'Seven Falls',
    description: 'A series of seven cascading waterfalls in a box canyon. 224 steps lead to the top with panoramic views.',
    latitude: 38.7889,
    longitude: -104.8786,
    categories: ['Nature', 'Hiking', 'Scenic'],
    status: 'Published',
    privacy: 'Public',
    url: 'https://www.sevenfalls.com',
  },
  {
    name: 'Red Rock Canyon Open Space',
    description: 'Popular hiking and rock climbing area on the west side of Colorado Springs. Features stunning red rock formations.',
    latitude: 38.8506,
    longitude: -104.8753,
    categories: ['Recreation', 'Hiking', 'Rock Climbing'],
    status: 'Published',
    privacy: 'Public',
  },
  {
    name: 'Palmer Park',
    description: 'Large urban park with hiking trails, picnic areas, and unique rock formations. Great city views.',
    latitude: 38.8592,
    longitude: -104.7903,
    categories: ['Recreation', 'Hiking', 'Picnic'],
    status: 'Published',
    privacy: 'Public',
  },
  {
    name: 'Private Workshop Location',
    description: 'Personal workshop and maker space. Contains woodworking, metalworking, and electronics equipment.',
    latitude: 38.8339,
    longitude: -104.8214,
    categories: ['Workshop', 'Private', 'Maker Space'],
    status: 'Published',
    privacy: 'Private',
    password: 'workshop2024', // Simple password for demo
    shareToken: generateShareToken(),
  },
  {
    name: 'Secret Hiking Trail',
    description: 'A lesser-known hiking trail with amazing views. Shared with trusted friends only.',
    latitude: 38.8756,
    longitude: -105.1234,
    categories: ['Hiking', 'Nature', 'Secret'],
    status: 'Published',
    privacy: 'Private',
    password: 'trailpass',
    shareToken: generateShareToken(),
  },
  {
    name: 'Draft Location - Future Project',
    description: 'Placeholder for a future project location. Not yet ready for public viewing.',
    latitude: 38.8500,
    longitude: -104.8000,
    categories: ['Project', 'Planning'],
    status: 'Draft',
    privacy: 'Private',
    password: 'draft123',
    shareToken: generateShareToken(),
  },
];

// Main seed function
async function main() {
  console.log('🚀 Starting locations seed...\n');

  // Initialize PocketBase
  const pbUrl = getEnvVar('POCKETBASE_URL');
  const pb = new PocketBase(pbUrl);

  // Authenticate as admin
  try {
    const adminEmail = getEnvVar('POCKETBASE_ADMIN_EMAIL');
    const adminPassword = getEnvVar('POCKETBASE_ADMIN_PASSWORD');

    await pb.admins.authWithPassword(adminEmail, adminPassword);
    console.log('✓ Authenticated as admin\n');
  } catch (error) {
    console.error('❌ Failed to authenticate with PocketBase:', error);
    console.error('\nMake sure:');
    console.error('1. PocketBase is running');
    console.error('2. POCKETBASE_URL is correct in .env.local');
    console.error('3. POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD are correct');
    process.exit(1);
  }

  console.log('📍 Creating sample locations...\n');

  let created = 0;
  let failed = 0;

  for (const location of SAMPLE_LOCATIONS) {
    try {
      const record = await pb.collection('locations').create(location);
      created++;

      const privacyBadge = location.privacy === 'Private' ? '🔒' : '🌍';
      const statusBadge = location.status === 'Published' ? '✓' : '📝';

      console.log(`  ${privacyBadge} ${statusBadge} ${location.name}`);

      if (location.privacy === 'Private') {
        console.log(`     Password: ${location.password}`);
        console.log(`     Share Token: ${location.shareToken}`);
      }
    } catch (error: any) {
      failed++;
      console.error(`  ❌ Failed to create ${location.name}:`, error?.message || error);
    }
  }

  console.log(`\n✅ Seed complete!`);
  console.log(`   Created: ${created} locations`);
  console.log(`   Failed: ${failed} locations`);

  if (created > 0) {
    console.log('\n📝 Summary:');
    console.log('   - Public locations are visible on the map without authentication');
    console.log('   - Private locations require a password to unlock');
    console.log('   - Draft locations are only visible to admins');
    console.log('\n💡 Tip: You can test private locations with the passwords shown above');
  }
}

main();
