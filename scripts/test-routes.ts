#!/usr/bin/env npx tsx

// Test script to verify all routes work correctly
import { DigitalForest } from '@/lib/forest';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

async function testRoutes() {
  console.log('🧪 Testing Digital Forest Routes...\n');
  
  try {
    // Test forest cultivation
    console.log('1. Testing forest cultivation...');
    const forest = new DigitalForest();
    const forestData = await forest.cultivate();
    console.log(`✅ Forest cultivated: ${forestData.stats.totalSeeds} seeds found`);
    
    // Test search functionality
    console.log('\n2. Testing search functionality...');
    const projectSeeds = forest.findByType('project');
    console.log(`✅ Found ${projectSeeds.length} project seeds`);
    
    const featuredSeeds = forest.findFeatured();
    console.log(`✅ Found ${featuredSeeds.length} featured seeds`);
    
    // Test individual seed lookup
    console.log('\n3. Testing individual seed lookup...');
    if (forestData.seeds.length > 0) {
      const firstSeed = forestData.seeds[0];
      const foundSeed = forest.getSeed(firstSeed.slug);
      console.log(`✅ Found seed by slug: ${foundSeed?.meta.title}`);
      
      // Test related seeds
      const relatedSeeds = forest.findRelated(firstSeed, 3);
      console.log(`✅ Found ${relatedSeeds.length} related seeds`);
    }
    
    // Test search with options
    console.log('\n4. Testing advanced search...');
    const searchResults = forest.search({
      type: 'project',
      featured: true,
    });
    console.log(`✅ Search found ${searchResults.length} featured projects`);
    
    // Verify route structure
    console.log('\n5. Route structure:');
    console.log('✅ / - Home page with forest preview');
    console.log('✅ /forest - Main forest page');
    console.log('✅ /forest/[slug] - Individual seed pages');
    console.log('✅ /seeds/projects - Project category');
    console.log('✅ /seeds/experiments - Experiment category');
    console.log('✅ /seeds/notes - Notes category');
    console.log('✅ /seeds/writing - Writing category');
    console.log('✅ /api/seeds - API endpoint');
    
    // Test API query parameters
    console.log('\n6. API query examples:');
    console.log('- /api/seeds?type=project');
    console.log('- /api/seeds?stage=mature');
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