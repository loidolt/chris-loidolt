#!/usr/bin/env tsx

/**
 * Migrate to Multi-Tenant Architecture
 *
 * This script:
 * 1. Creates person records for each family member
 * 2. Links Chris to the existing admin user
 * 3. Migrates all existing projects/skills to Chris's person record
 * 4. Sets default scope/visibility values
 *
 * Prerequisites:
 * - PocketBase must be running (default: http://127.0.0.1:8090)
 * - Schema must be updated with persons collection and new fields
 * - npm run import:schema must have been run first
 *
 * Usage: npm run migrate:multitenant
 */

import PocketBase from 'pocketbase';
import dotenv from 'dotenv';

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

// Person data
const PERSONS = [
  {
    name: 'Chris Loidolt',
    slug: 'chris',
    email: 'chris@loidolt.space',
    bio: '<p>Designer, engineer, and builder.</p>',
  },
  {
    name: 'Julia Loidolt',
    slug: 'julia',
    email: 'julia@loidolt.space',
    bio: '',
  },
  {
    name: 'Theo Loidolt',
    slug: 'theo',
    email: 'theo@loidolt.space',
    bio: '',
  },
  {
    name: 'Jack Loidolt',
    slug: 'jack',
    email: 'jack@loidolt.space',
    bio: '',
  },
];

async function createPersons(pb: PocketBase): Promise<Record<string, string>> {
  console.log('\n👥 Creating person records...');

  const personIds: Record<string, string> = {};

  for (const personData of PERSONS) {
    try {
      // Check if person already exists
      const existing = await pb.collection('persons').getFirstListItem(`slug="${personData.slug}"`).catch(() => null);

      if (existing) {
        console.log(`  ✓ ${personData.name} already exists`);
        personIds[personData.slug] = existing.id;
      } else {
        const person = await pb.collection('persons').create(personData);
        console.log(`  ✓ Created ${personData.name}`);
        personIds[personData.slug] = person.id;
      }
    } catch (error: any) {
      console.error(`  ❌ Failed to create ${personData.name}:`, error?.message || error);
    }
  }

  return personIds;
}

async function linkChrisToAdmin(pb: PocketBase, chrisId: string): Promise<void> {
  console.log('\n🔗 Linking Chris to admin user...');

  try {
    // Get admin email from env
    const adminEmail = getEnvVar('POCKETBASE_ADMIN_EMAIL');

    // Find user with matching email
    const users = await pb.collection('users').getFullList();
    const adminUser = users.find(u => u.email === adminEmail);

    if (adminUser) {
      // Update Chris's person record to link to user
      await pb.collection('persons').update(chrisId, {
        user: adminUser.id,
      });
      console.log(`  ✓ Linked Chris to user ${adminUser.email}`);
    } else {
      console.log(`  ⚠️  No user found with email ${adminEmail}`);
    }
  } catch (error: any) {
    console.error(`  ❌ Failed to link Chris to user:`, error?.message || error);
  }
}

async function migrateProjects(pb: PocketBase, chrisId: string): Promise<void> {
  console.log('\n📦 Migrating projects to Chris...');

  try {
    const projects = await pb.collection('projects').getFullList();
    console.log(`  Found ${projects.length} projects`);

    let migrated = 0;

    for (const project of projects) {
      try {
        // Skip if already has person assigned
        if (project.person && Array.isArray(project.person) && project.person.length > 0) {
          continue;
        }

        await pb.collection('projects').update(project.id, {
          person: [chrisId],
          scope: 'Personal',
          visibility: project.status === 'Published' ? 'Public' : 'Private',
        });
        migrated++;
      } catch (error: any) {
        console.error(`    ❌ Failed to migrate project ${project.id}:`, error?.message || error);
      }
    }

    console.log(`  ✓ Migrated ${migrated} projects`);
  } catch (error: any) {
    console.error(`  ❌ Failed to migrate projects:`, error?.message || error);
  }
}

async function migrateSkills(pb: PocketBase, chrisId: string): Promise<void> {
  console.log('\n🎯 Migrating skills to Chris...');

  try {
    const skills = await pb.collection('skills').getFullList();
    console.log(`  Found ${skills.length} skills`);

    let migrated = 0;

    for (const skill of skills) {
      try {
        // Skip if already has person assigned
        if (skill.person && Array.isArray(skill.person) && skill.person.length > 0) {
          continue;
        }

        await pb.collection('skills').update(skill.id, {
          person: [chrisId],
          scope: 'Personal',
          visibility: 'Public',
        });
        migrated++;
      } catch (error: any) {
        console.error(`    ❌ Failed to migrate skill ${skill.id}:`, error?.message || error);
      }
    }

    console.log(`  ✓ Migrated ${migrated} skills`);
  } catch (error: any) {
    console.error(`  ❌ Failed to migrate skills:`, error?.message || error);
  }
}

async function migrateServices(pb: PocketBase): Promise<void> {
  console.log('\n🛠️  Migrating services...');

  try {
    const services = await pb.collection('services').getFullList();
    console.log(`  Found ${services.length} services`);

    let migrated = 0;

    for (const service of services) {
      try {
        // Skip if already has scope/visibility assigned
        if (service.scope || service.visibility) {
          continue;
        }

        await pb.collection('services').update(service.id, {
          scope: 'Family',
          visibility: service.active ? 'Public' : 'Private',
        });
        migrated++;
      } catch (error: any) {
        console.error(`    ❌ Failed to migrate service ${service.id}:`, error?.message || error);
      }
    }

    console.log(`  ✓ Migrated ${migrated} services`);
  } catch (error: any) {
    console.error(`  ❌ Failed to migrate services:`, error?.message || error);
  }
}

async function migrateLocations(pb: PocketBase): Promise<void> {
  console.log('\n📍 Migrating locations...');

  try {
    const locations = await pb.collection('locations').getFullList();
    console.log(`  Found ${locations.length} locations`);

    let migrated = 0;

    for (const location of locations) {
      try {
        // Skip if already has scope/visibility assigned
        if (location.scope || location.visibility) {
          continue;
        }

        await pb.collection('locations').update(location.id, {
          scope: 'Family',
          visibility: location.privacy === 'Public' ? 'Public' : 'Private',
        });
        migrated++;
      } catch (error: any) {
        console.error(`    ❌ Failed to migrate location ${location.id}:`, error?.message || error);
      }
    }

    console.log(`  ✓ Migrated ${migrated} locations`);
  } catch (error: any) {
    console.error(`  ❌ Failed to migrate locations:`, error?.message || error);
  }
}

async function main() {
  console.log('🚀 Starting multi-tenant migration...\n');

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
    console.error('2. Schema has been imported (npm run import:schema)');
    console.error('3. POCKETBASE_URL is correct in .env.local');
    console.error('4. POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD are correct');
    process.exit(1);
  }

  try {
    // Step 1: Create person records
    const personIds = await createPersons(pb);

    // Step 2: Link Chris to admin user
    if (personIds.chris) {
      await linkChrisToAdmin(pb, personIds.chris);
    }

    // Step 3: Migrate existing data
    if (personIds.chris) {
      await migrateProjects(pb, personIds.chris);
      await migrateSkills(pb, personIds.chris);
    }

    await migrateServices(pb);
    await migrateLocations(pb);

    console.log('\n✅ Migration complete!');
    console.log('\nNext steps:');
    console.log('1. Verify data in PocketBase admin panel');
    console.log('2. Update TypeScript interfaces and data fetching functions');
    console.log('3. Test the application');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
