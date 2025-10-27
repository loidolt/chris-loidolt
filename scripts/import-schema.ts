#!/usr/bin/env tsx
/**
 * Import PocketBase schema from pb_schema.json
 * This allows declarative schema management - define your schema in JSON and import it
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

interface Collection {
  id: string;
  name: string;
  type: string;
  system?: boolean;
  fields?: any[];
  [key: string]: any;
}

async function importSchema() {
  console.log('📋 PocketBase Schema Import');
  console.log('─'.repeat(50));

  // Read schema file
  const schemaPath = path.join(__dirname, '..', 'pb_schema.json');

  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file not found:', schemaPath);
    console.error('   Export your schema from PocketBase admin: Settings → Import/Export → Export collections');
    process.exit(1);
  }

  const schema: Collection[] = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  console.log(`📦 Loaded schema with ${schema.length} collections`);

  // Initialize PocketBase client
  const pb = new PocketBase(POCKETBASE_URL);

  // Authenticate as admin
  console.log(`\n🔐 Authenticating as admin...`);
  try {
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Authenticated successfully');
  } catch (error: any) {
    console.error('❌ Failed to authenticate:', error.message);
    process.exit(1);
  }

  // Import schema using collections import API
  console.log(`\n📥 Importing collections...`);

  try {
    const response = await pb.send('/api/collections/import', {
      method: 'PUT',
      body: {
        collections: schema,
        deleteMissing: false, // Don't delete collections not in the schema
      },
    });

    console.log('✅ Schema imported successfully!');

    // List imported collections
    const customCollections = schema.filter(c => !c.system);
    console.log(`\n📚 Custom collections (${customCollections.length}):`);
    customCollections.forEach(c => {
      const fieldCount = c.fields?.filter((f: any) => !f.system).length || 0;
      console.log(`   • ${c.name.padEnd(15)} (${c.type.padEnd(4)}) - ${fieldCount} fields`);
    });

    console.log('\n✅ Schema import complete!');
    console.log(`🔗 View in admin: ${POCKETBASE_URL}/_/`);
  } catch (error: any) {
    console.error('❌ Failed to import schema:', error.message);
    if (error.response) {
      console.error('   Response:', JSON.stringify(error.response, null, 2));
    }
    process.exit(1);
  }
}

// Run import
importSchema().catch((error) => {
  console.error('❌ Import failed:', error);
  process.exit(1);
});
