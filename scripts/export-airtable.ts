#!/usr/bin/env tsx

/**
 * Export all data from Airtable to JSON files for migration to PocketBase
 *
 * This script:
 * 1. Fetches all records from Airtable tables (Projects, Qualifications, Services, Websites, Locations)
 * 2. Downloads all file attachments to a temp directory
 * 3. Saves records as JSON for import into PocketBase
 *
 * IMPORTANT: You must temporarily install airtable to run this script:
 *   npm install airtable --legacy-peer-deps
 *
 * Usage: npm run export:airtable
 */

// @ts-ignore - Airtable is only installed when running this script
import Airtable from 'airtable';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output directory for exported data
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

// Initialize Airtable
function getAirtableBase() {
  const apiKey = getEnvVar('AIRTABLE_API_KEY');
  const baseId = getEnvVar('AIRTABLE_POSTS_BASEID');

  Airtable.configure({ apiKey });
  return Airtable.base(baseId);
}

// Download file from URL
async function downloadFile(url: string, filePath: string): Promise<void> {
  const protocol = url.startsWith('https') ? https : http;

  return new Promise((resolve, reject) => {
    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        if (response.headers.location) {
          downloadFile(response.headers.location, filePath).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.open(filePath, 'w').then((handle) => {
        const stream = response.pipe(require('fs').createWriteStream(filePath));
        stream.on('finish', () => resolve());
        stream.on('error', reject);
      });
    }).on('error', reject);
  });
}

// Generate unique filename from URL and original filename
function getFileId(url: string, filename: string): string {
  const hash = Buffer.from(url).toString('base64').slice(0, 16).replace(/[^a-zA-Z0-9]/g, '');
  const ext = path.extname(filename);
  const name = path.basename(filename, ext).slice(0, 20).replace(/[^a-zA-Z0-9-]/g, '_');
  return `${hash}_${name}${ext}`;
}

// Export table to JSON with file downloads
async function exportTable(tableName: string, collectionName: string): Promise<any[]> {
  console.log(`\n📦 Exporting ${tableName}...`);

  const base = getAirtableBase();
  const records = await base(tableName).select().all();

  console.log(`  Found ${records.length} records`);

  const exportedRecords: any[] = [];
  let filesDownloaded = 0;

  for (const record of records) {
    const fields = record.fields;
    const exportRecord: any = {
      airtableId: record.id,
      fields: {},
    };

    // Process each field
    for (const [key, value] of Object.entries(fields)) {
      if (Array.isArray(value) && value.length > 0 && value[0].url) {
        // This is an attachment field
        const downloadedFiles: string[] = [];

        for (const attachment of value) {
          const fileId = getFileId(attachment.url, attachment.filename);
          const filePath = path.join(FILES_DIR, fileId);

          try {
            await downloadFile(attachment.url, filePath);
            downloadedFiles.push(fileId);
            filesDownloaded++;
          } catch (error) {
            console.error(`    ⚠️  Failed to download ${attachment.filename}:`, error);
          }
        }

        exportRecord.fields[key] = downloadedFiles;
      } else {
        // Regular field
        exportRecord.fields[key] = value;
      }
    }

    exportedRecords.push(exportRecord);
  }

  if (filesDownloaded > 0) {
    console.log(`  Downloaded ${filesDownloaded} files`);
  }

  // Save JSON
  const jsonPath = path.join(EXPORT_DIR, `${collectionName}.json`);
  await fs.writeFile(jsonPath, JSON.stringify(exportedRecords, null, 2));
  console.log(`  ✓ Saved to ${collectionName}.json`);

  return exportedRecords;
}

// Main export function
async function main() {
  console.log('🚀 Starting Airtable export...\n');

  // Create export directories
  await fs.mkdir(EXPORT_DIR, { recursive: true });
  await fs.mkdir(FILES_DIR, { recursive: true });

  try {
    // Export all tables
    // Note: Qualifications table is exported as 'skills' to match the PocketBase schema
    const tables = [
      { airtable: getEnvVar('AIRTABLE_POSTS_TABLENAME'), pocketbase: 'projects' },
      { airtable: getEnvVar('AIRTABLE_QUALIFICATIONS_TABLENAME'), pocketbase: 'skills' },
      { airtable: getEnvVar('AIRTABLE_SERVICES_TABLENAME'), pocketbase: 'services' },
      { airtable: getEnvVar('AIRTABLE_WEBSITES_TABLENAME'), pocketbase: 'websites' },
      // Note: Locations table might not exist in Airtable - will fail gracefully
      // { airtable: getEnvVar('AIRTABLE_LOCATIONS_TABLENAME'), pocketbase: 'locations' },
    ];

    for (const table of tables) {
      try {
        await exportTable(table.airtable, table.pocketbase);
      } catch (error: any) {
        console.error(`  ❌ Failed to export ${table.airtable}:`, error?.message || error);
        console.error(`     Skipping this table...`);
      }
    }

    console.log('\n✅ Export complete!');
    console.log(`\nExported data location: ${EXPORT_DIR}`);
    console.log('\nNext steps:');
    console.log('1. Set up your PocketBase instance and create collections');
    console.log('2. Run: npm run import:pocketbase');
  } catch (error) {
    console.error('\n❌ Export failed:', error);
    process.exit(1);
  }
}

main();
