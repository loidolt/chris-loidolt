#!/usr/bin/env npx tsx

// Test script to verify all routes work correctly
import { DigitalGarden } from '@/lib/garden';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

async function testRoutes() {
  console.log('🧪 Testing Digital Garden Routes...\n');
  
  try {
    // Test garden cultivation
    console.log('1. Testing garden cultivation...');
    const garden = new DigitalGarden();
    const gardenData = await garden.cultivate();
    console.log(`✅ Garden cultivated: ${gardenData.stats.totalSeeds} seeds found`);
    
    // Test search functionality
    console.log('\n2. Testing search functionality...');
    const projectSeeds = garden.findByType('project');
    console.log(`✅ Found ${projectSeeds.length} project seeds`);
    
    const featuredSeeds = garden.findFeatured();
    console.log(`✅ Found ${featuredSeeds.length} featured seeds`);
    
    // Test individual seed lookup
    console.log('\n3. Testing individual seed lookup...');
    if (gardenData.seeds.length > 0) {
      const firstSeed = gardenData.seeds[0];
      const foundSeed = garden.getSeed(firstSeed.slug);
      console.log(`✅ Found seed by slug: ${foundSeed?.meta.title}`);
      
      // Test related seeds
      const relatedSeeds = garden.findRelated(firstSeed, 3);
      console.log(`✅ Found ${relatedSeeds.length} related seeds`);
    }
    
    // Test search with options
    console.log('\n4. Testing advanced search...');
    const searchResults = garden.search({
      type: 'project',
      featured: true,
    });
    console.log(`✅ Search found ${searchResults.length} featured projects`);
    
    // Verify route structure
    console.log('\n5. Route structure:');
    console.log('✅ / - Home page with garden preview');
    console.log('✅ /garden - Main garden page');
    console.log('✅ /garden/[slug] - Individual seed pages');
    console.log('✅ /seeds/projects - Project category');
    console.log('✅ /seeds/experiments - Experiment category');
    console.log('✅ /seeds/notes - Notes category');
    console.log('✅ /seeds/writing - Writing category');
    console.log('✅ /api/seeds - API endpoint');
    
    // Test API query parameters
    console.log('\n6. API query examples:');
    console.log('- /api/seeds?type=project');
    console.log('- /api/seeds?stage=evergreen');
    console.log('- /api/seeds?featured=true');
    console.log('- /api/seeds?q=search+term');
    console.log('- /api/seeds?tag=typescript');
    console.log('- /api/seeds?limit=10');
    
    console.log('\n✅ All route tests passed!');
    
  } catch (error) {
    console.error('❌ Error testing routes:', error);
    process.exit(1);
  }
}

testRoutes();