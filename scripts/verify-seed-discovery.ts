#!/usr/bin/env npx tsx

import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(process.cwd(), '.env.local') });

import { discoverSeeds } from '@/lib/seed';

async function verifySeedDiscovery() {
  console.log('🌲 Verifying Forest Seed Discovery\n');
  
  try {
    const result = await discoverSeeds();
    
    console.log(`✅ Discovery completed successfully`);
    console.log(`\n📊 Results:`);
    console.log(`  - Seeds found: ${result.seeds.length}`);
    console.log(`  - Errors: ${result.errors.length}`);
    console.log(`  - Duration: ${result.stats.duration}ms`);
    
    if (result.seeds.length > 0) {
      console.log(`\n🌱 Seeds in the forest:`);
      result.seeds.forEach(seed => {
        console.log(`  - ${seed.slug} (${seed.meta.stage}): "${seed.meta.title}"`);
      });
      
      // Check if floating-duck-house is found
      const floatingDuckHouse = result.seeds.find(s => s.slug === 'floating-duck-house');
      if (floatingDuckHouse) {
        console.log(`\n✅ SUCCESS: floating-duck-house repository is being discovered!`);
        console.log(`  - Title: ${floatingDuckHouse.meta.title}`);
        console.log(`  - Stage: ${floatingDuckHouse.meta.stage}`);
        console.log(`  - Type: ${floatingDuckHouse.meta.type}`);
      } else {
        console.log(`\n❌ WARNING: floating-duck-house repository not found in results`);
      }
    } else {
      console.log(`\n⚠️  No seeds found in the forest`);
    }
    
  } catch (error) {
    console.error('❌ Error during discovery:', error);
  }
}

verifySeedDiscovery();