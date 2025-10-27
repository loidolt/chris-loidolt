#!/usr/bin/env tsx
/**
 * Export PocketBase schema to pb_schema.json
 * Run this after making schema changes in PocketBase admin UI
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PocketBase from 'pocketbase';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration from environment
const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL || 'loidolt@gmail.com';
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD || 'Sykbif-dikhip-hicfu5';

async function exportSchema() {
  console.log('📤 PocketBase Schema Export');
  console.log('─'.repeat(50));

  // Initialize PocketBase client
  const pb = new PocketBase(POCKETBASE_URL);

  // Authenticate as admin
  console.log(`🔐 Authenticating as admin...`);
  try {
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Authenticated successfully');
  } catch (error: any) {
    console.error('❌ Failed to authenticate:', error.message);
    process.exit(1);
  }

  // Fetch all collections
  console.log(`\n📦 Fetching collections...`);
  try {
    const collections = await pb.collections.getFullList();
    console.log(`✅ Retrieved ${collections.length} collections`);

    // Save to file
    const schemaPath = path.join(__dirname, '..', 'pb_schema.json');
    fs.writeFileSync(schemaPath, JSON.stringify(collections, null, 2));

    console.log(`\n💾 Schema exported to: pb_schema.json`);

    // Summary
    const customCollections = collections.filter((c: any) => !c.system);
    console.log(`\n📚 Custom collections (${customCollections.length}):`);
    customCollections.forEach((c: any) => {
      const fieldCount = c.fields?.filter((f: any) => !f.system).length || 0;
      console.log(`   • ${c.name.padEnd(15)} (${c.type.padEnd(4)}) - ${fieldCount} fields`);
    });

    console.log('\n✅ Export complete!');
    console.log('💡 Commit pb_schema.json to version control for declarative schema management');
  } catch (error: any) {
    console.error('❌ Failed to export schema:', error.message);
    process.exit(1);
  }
}

// Run export
exportSchema().catch((error) => {
  console.error('❌ Export failed:', error);
  process.exit(1);
});
