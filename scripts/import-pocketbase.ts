#!/usr/bin/env tsx

/**
 * Import data from Airtable export to PocketBase
 *
 * This script:
 * 1. Reads exported JSON files from .airtable-export/
 * 2. Authenticates with PocketBase as admin
 * 3. Creates records in PocketBase collections
 * 4. Uploads file attachments
 *
 * Prerequisites:
 * - PocketBase must be running (default: http://127.0.0.1:8090)
 * - Collections must be created in PocketBase with correct schema
 * - npm run export:airtable must have been run first
 *
 * Usage: npm run import:pocketbase
 */

import PocketBase from 'pocketbase';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import directory
const EXPORT_DIR = path.join(__dirname, '../.airtable-export');
const FILES_DIR = path.join(EXPORT_DIR, 'files');

// Helper to get environment variable
function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

// Field mapping: Airtable field name → PocketBase field name
const FIELD_MAPPINGS: Record<string, Record<string, string>> = {
  projects: {
    'Title': 'title',
    'Name': 'title',
    'Slug': 'slug',
    'Description': 'description',
    'Excerpt': 'description',
    'LongDescription': 'longDescription',
    'Content': 'longDescription',
    'Body': 'longDescription',
    'Markdown': 'markdown',
    'Tags': 'tags',
    'Categories': 'categories',
    'Category': 'categories',
    'Date': 'date',
    'Cover Image': 'featuredImage',
    'FeaturedImage': 'featuredImage',
    'Image': 'featuredImage',
    'Gallery': 'gallery',
    'Images': 'gallery',
    'ModelFile': 'modelFile',
    'Model3D': 'modelFile',
    'GLBFile': 'modelFile',
    'ModelPath': 'modelPath',
    'Model URL': 'modelUrl',
    'Repository': 'repository',
    'GitHub': 'repository',
    'github': 'repository',
    'Website': 'website',
    'website': 'website',
    'URL': 'website',
    'Attribution': 'attribution',
    'Status': 'status',
    'Clean Repo': 'cleanRepo',
    'Last Modified': 'updatedAt',
    'Featured': 'featured',
    'featured': 'featured',
  },
  // Renamed from 'qualifications' to match the skills-based structure
  skills: {
    'Name': 'name',
    'Title': 'name',
    'Summary': 'summary',
    'Description': 'summary',
    'Type': 'type',
    'Category': 'category',
    'Categories': 'categories',
    'Level': 'level',
    'More Info': 'moreInfo',
    'moreInfo': 'moreInfo',
    'Order': 'order',
  },
  services: {
    'Name': 'title',
    'Title': 'title',
    'Subtitle': 'subtitle',
    'Summary': 'description',
    'Description': 'description',
    'Icon': 'icon',
    'URL': 'url',
    'More Info': 'moreInfo',
    'moreInfo': 'moreInfo',
    'Image': 'image',
    'Status': 'active', // Will be converted from select to boolean
    'Order': 'order',
  },
  websites: {
    'Name': 'name',
    'Title': 'name',
    'URL': 'url',
    'Link': 'url',
    'Status URL': 'statusUrl',
    'statusUrl': 'statusUrl',
    'Summary': 'description',
    'Description': 'description',
    'Image': 'image',
    'Status': 'active', // Will be converted from select to boolean
    'Order': 'order',
  },
  locations: {
    'Name': 'name',
    'Title': 'name',
    'Description': 'description',
    'Latitude': 'latitude',
    'Longitude': 'longitude',
    'Categories': 'categories',
    'Category': 'categories',
    'Image': 'image',
    'URL': 'url',
    'Status': 'status',
    'Privacy': 'privacy',
    'Password': 'password',
    'ShareToken': 'shareToken',
  },
};

// Type converters for specific fields
const TYPE_CONVERTERS: Record<string, Record<string, (value: any) => any>> = {
  services: {
    'Status': (value: string) => value === 'Published',
    'active': (value: string) => value === 'Published',
  },
  websites: {
    'Status': (value: string) => value === 'Published',
    'active': (value: string) => value === 'Published',
  },
  projects: {
    'Date': (value: string) => {
      // Ensure date is in proper format
      if (!value) return null;
      try {
        return new Date(value).toISOString().split('T')[0];
      } catch {
        return value;
      }
    },
  },
};

// Transform Airtable record to PocketBase record
function transformRecord(airtableRecord: any, collectionName: string): any {
  const mapping = FIELD_MAPPINGS[collectionName] || {};
  const converters = TYPE_CONVERTERS[collectionName] || {};
  const pbRecord: any = {};
  const fileFields: Record<string, string[]> = {};

  for (const [airtableKey, value] of Object.entries(airtableRecord.fields)) {
    const pbKey = mapping[airtableKey] || airtableKey.toLowerCase();

    // Handle file fields (arrays of filenames from export)
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string' && value[0].includes('_')) {
      fileFields[pbKey] = value as string[];
    } else {
      // Apply type converter if exists
      const converter = converters[airtableKey] || converters[pbKey];
      pbRecord[pbKey] = converter ? converter(value) : value;
    }
  }

  // Generate slug if missing (for projects)
  if (collectionName === 'projects' && !pbRecord.slug && pbRecord.title) {
    pbRecord.slug = pbRecord.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  // Set publishedAt to date for published projects
  if (collectionName === 'projects' && pbRecord.status === 'Published' && pbRecord.date && !pbRecord.publishedAt) {
    pbRecord.publishedAt = pbRecord.date;
  }

  return { pbRecord, fileFields };
}

// Import a collection
async function importCollection(pb: PocketBase, collectionName: string): Promise<void> {
  console.log(`\n📦 Importing ${collectionName}...`);

  // Read JSON file
  const jsonPath = path.join(EXPORT_DIR, `${collectionName}.json`);
  const jsonContent = await fs.readFile(jsonPath, 'utf-8');
  const records = JSON.parse(jsonContent);

  console.log(`  Found ${records.length} records`);

  let imported = 0;
  let failed = 0;

  for (const airtableRecord of records) {
    const { pbRecord, fileFields } = transformRecord(airtableRecord, collectionName);

    try {
      // Create FormData for file uploads
      const formData = new FormData();

      // Add regular fields
      for (const [key, value] of Object.entries(pbRecord)) {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      }

      // Add file fields
      for (const [fieldName, fileIds] of Object.entries(fileFields)) {
        for (const fileId of fileIds as string[]) {
          const filePath = path.join(FILES_DIR, fileId);
          try {
            const fileBuffer = await fs.readFile(filePath);
            const blob = new Blob([fileBuffer]);
            formData.append(fieldName, blob, fileId);
          } catch (error) {
            console.warn(`    ⚠️  Could not read file ${fileId}`);
          }
        }
      }

      // Create record in PocketBase
      await pb.collection(collectionName).create(formData);
      imported++;

      if (imported % 10 === 0) {
        console.log(`  Progress: ${imported}/${records.length}`);
      }
    } catch (error: any) {
      failed++;
      console.error(`    ❌ Failed to import record:`, error?.message || error);
      if (error?.data) {
        console.error(`       Details:`, JSON.stringify(error.data, null, 2));
      }
    }
  }

  console.log(`  ✓ Imported ${imported} records (${failed} failed)`);
}

// Main import function
async function main() {
  console.log('🚀 Starting PocketBase import...\n');

  // Check if export directory exists
  try {
    await fs.access(EXPORT_DIR);
  } catch {
    console.error('❌ Export directory not found. Please run: npm run export:airtable');
    process.exit(1);
  }

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

  try {
    // Import all collections
    // Note: 'qualifications' renamed to 'skills' to match updated schema
    const collections = ['projects', 'skills', 'services', 'websites', 'locations'];

    for (const collection of collections) {
      const jsonPath = path.join(EXPORT_DIR, `${collection}.json`);
      try {
        await fs.access(jsonPath);
        await importCollection(pb, collection);
      } catch {
        console.log(`\n⚠️  Skipping ${collection} (file not found)`);
      }
    }

    console.log('\n✅ Import complete!');
    console.log('\nNext steps:');
    console.log('1. Verify data in PocketBase admin panel');
    console.log('2. Update your Next.js app to use PocketBase');
    console.log('3. Test the application');
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

main();
