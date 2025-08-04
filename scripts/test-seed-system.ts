import { config } from 'dotenv';
config({ path: '.env.local' });

import { discoverSeeds, discoverSeed } from '../lib/seed';

async function testSeedSystem() {
  console.log('🌱 Testing Seed Discovery System\n');
  
  try {
    // Test full discovery
    console.log('1. Running full seed discovery...');
    const result = await discoverSeeds({
      maxConcurrent: 3,  // Limit concurrent requests for testing
    });
    
    console.log('\n📊 Discovery Results:');
    console.log(`  - Total repositories: ${result.stats.totalRepos}`);
    console.log(`  - Repositories with .seed: ${result.stats.reposWithSeed}`);
    console.log(`  - Successfully processed: ${result.stats.successfullyProcessed}`);
    console.log(`  - Failed: ${result.stats.failed}`);
    console.log(`  - Duration: ${(result.stats.duration / 1000).toFixed(2)}s`);
    
    if (result.seeds.length > 0) {
      console.log('\n🌱 Discovered Seeds:');
      for (const seed of result.seeds) {
        console.log(`\n  ${seed.meta.title} (${seed.slug})`);
        console.log(`    - Type: ${seed.meta.type}`);
        console.log(`    - Stage: ${seed.meta.stage}`);
        console.log(`    - Excerpt: ${seed.excerpt.substring(0, 80)}...`);
        console.log(`    - Reading time: ${seed.readingTime} min`);
        console.log(`    - Source: ${seed.source.url}`);
      }
    } else {
      console.log('\n⚠️  No seeds found. Repositories need a .seed/meta.yml file.');
    }
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      for (const error of result.errors) {
        console.log(`  - ${error.repository}: ${error.error}`);
      }
    }
    
    // Test single repository discovery
    console.log('\n\n2. Testing single repository discovery...');
    try {
      const floatingDuckHouse = await discoverSeed('floating-duck-house');
      console.log('❌ floating-duck-house found but it uses .garden, not .seed');
    } catch (error) {
      console.log('✅ Expected error (no .seed directory):', error.message);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

// Show example .seed structure
console.log('📁 Example .seed directory structure:');
console.log('```');
console.log('your-repo/');
console.log('├── .seed/');
console.log('│   ├── meta.yml      # Required: title, type, stage');
console.log('│   └── README.md     # Optional: defaults to root README.md');
console.log('└── ... (your project files)');
console.log('```\n');

console.log('📄 Example meta.yml:');
console.log('```yaml');
console.log('# Required fields');
console.log('title: Your Project Name');
console.log('type: project        # project, experiment, note, or writing');
console.log('stage: budding       # seedling, budding, evergreen, or perennial');
console.log('');
console.log('# Optional fields');
console.log('description: Brief description of your project');
console.log('tags: [react, typescript]');
console.log('featured: true');
console.log('```\n');

testSeedSystem();