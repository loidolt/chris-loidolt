#!/usr/bin/env tsx
/**
 * Initialize persons collection with family members
 */

import PocketBase from 'pocketbase';

const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL || 'loidolt@gmail.com';
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD || 'Sykbif-dikhip-hicfu5';

async function initPersons() {
  console.log('👤 Initializing Persons Collection');
  console.log('─'.repeat(50));

  const pb = new PocketBase(POCKETBASE_URL);

  // Authenticate as admin
  console.log('\n🔐 Authenticating as admin...');
  try {
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Authenticated successfully');
  } catch (error: any) {
    console.error('❌ Failed to authenticate:', error.message);
    process.exit(1);
  }

  // Define person records
  const persons = [
    {
      name: 'Chris Loidolt',
      slug: 'chris',
      email: 'chris@loidolt.space',
      bio: '<p>Software engineer, maker, and lifelong learner</p>',
      enabledRoutes: ['projects', 'gis', 'about', 'contact'],
      homepageConfig: {
        layout: 'grid',
        showProjects: true,
        showStats: true
      }
    },
    {
      name: 'Julia Loidolt',
      slug: 'julia',
      email: 'julia@loidolt.space',
      bio: '<p>Artist and creative soul</p>',
      enabledRoutes: ['projects', 'about', 'contact'],
      homepageConfig: {
        layout: 'grid',
        showProjects: true,
        showStats: false
      }
    },
    {
      name: 'Theo Loidolt',
      slug: 'theo',
      email: 'theo@loidolt.space',
      bio: '<p>Young explorer and tech enthusiast</p>',
      enabledRoutes: ['projects', 'about'],
      homepageConfig: {
        layout: 'minimal',
        showProjects: true,
        showStats: false
      }
    },
    {
      name: 'Jack Loidolt',
      slug: 'jack',
      email: 'jack@loidolt.space',
      bio: '<p>Adventure seeker and sports lover</p>',
      enabledRoutes: ['projects', 'gis', 'about'],
      homepageConfig: {
        layout: 'grid',
        showProjects: true,
        showStats: true
      }
    }
  ];

  console.log('\n👤 Creating person records...');

  for (const person of persons) {
    try {
      // Check if person already exists
      const existing = await pb.collection('persons').getList(1, 1, {
        filter: `slug="${person.slug}"`
      });

      if (existing.items.length > 0) {
        console.log(`   • ${person.name} (${person.slug}) - Already exists, updating...`);
        await pb.collection('persons').update(existing.items[0].id, person);
        console.log(`   ✅ Updated ${person.name}`);
      } else {
        console.log(`   • ${person.name} (${person.slug}) - Creating...`);
        await pb.collection('persons').create(person);
        console.log(`   ✅ Created ${person.name}`);
      }
    } catch (error: any) {
      console.error(`   ❌ Failed to create/update ${person.name}:`, error.message);
      if (error.response) {
        console.error('   Response:', JSON.stringify(error.response, null, 2));
      }
    }
  }

  console.log('\n✅ Persons initialization complete!');
  console.log(`🔗 View in admin: ${POCKETBASE_URL}/_/`);
}

// Run initialization
initPersons().catch((error) => {
  console.error('❌ Initialization failed:', error);
  process.exit(1);
});
