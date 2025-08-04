#!/usr/bin/env npx tsx

import { DigitalForest } from '@/lib/forest';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

async function viewSeedDetails() {
  console.log('🌱 Viewing Seed Details\n');
  
  try {
    const forest = new DigitalForest();
    const forestData = await forest.cultivate();
    
    console.log(`Found ${forestData.stats.totalSeeds} seed(s)\n`);
    
    if (forestData.seeds.length > 0) {
      const seed = forestData.seeds[0];
      
      console.log('📋 Seed Details:');
      console.log('================\n');
      
      console.log('Basic Info:');
      console.log(`  Slug: ${seed.slug}`);
      console.log(`  Title: ${seed.meta.title}`);
      console.log(`  Type: ${seed.meta.type}`);
      console.log(`  Stage: ${seed.meta.stage}`);
      
      console.log('\nDescription:');
      console.log(`  ${seed.meta.description || seed.excerpt}`);
      
      console.log('\nMetadata:');
      console.log(`  Featured: ${seed.meta.featured ? 'Yes' : 'No'}`);
      console.log(`  Tags: ${seed.meta.tags?.join(', ') || 'None'}`);
      console.log(`  Planted: ${seed.meta.planted || 'Unknown'}`);
      console.log(`  Last Tended: ${seed.meta.tended || 'Unknown'}`);
      
      console.log('\nContent Info:');
      console.log(`  Word Count: ${seed.wordCount}`);
      console.log(`  Reading Time: ${seed.readingTime} minutes`);
      console.log(`  Content Path: ${seed.path}`);
      
      console.log('\nSource Info:');
      console.log(`  Repository: ${seed.source.name}`);
      console.log(`  Owner: ${seed.source.owner}`);
      console.log(`  Stars: ${seed.source.stars || 0}`);
      console.log(`  URL: ${seed.source.url}`);
      
      console.log('\nContent Preview:');
      console.log('----------------');
      const contentPreview = seed.raw.substring(0, 300).trim();
      console.log(contentPreview + '...\n');
      
      console.log('\n✅ Seed is ready to be displayed in the digital forest!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

viewSeedDetails();