import { config } from 'dotenv';
config({ path: '.env.local' });

import { GitHubClient } from '../lib/github/client';
import { DiscoveryEngine } from '../lib/discovery/engine';
import { ContentProcessor } from '../lib/content/processor';

async function testFloatingDuckHouseV2() {
  console.log('🦆 Testing floating-duck-house with improved system\n');
  
  const client = new GitHubClient(
    process.env.GITHUB_TOKEN!,
    process.env.GITHUB_OWNER!
  );
  
  const discovery = new DiscoveryEngine(client);
  const processor = new ContentProcessor(client);
  
  try {
    // Use the new discovery engine
    console.log('1. Testing new .garden-based discovery...');
    const repos = await discovery.discover();
    const floatingDuckHouse = repos.find(r => r.name === 'floating-duck-house');
    
    if (!floatingDuckHouse) {
      console.log('❌ Repository not found by discovery engine');
      return;
    }
    
    console.log('✅ Found by discovery engine!');
    console.log(`   - Name: ${floatingDuckHouse.name}`);
    console.log(`   - Topics: ${floatingDuckHouse.topics.join(', ') || 'None'}`);
    
    // Process the content
    console.log('\n2. Processing garden content...');
    const content = await processor.processRepository(floatingDuckHouse);
    
    if (content) {
      console.log('✅ Successfully processed!');
      console.log('\nContent Details:');
      console.log(`  - Title: ${content.title}`);
      console.log(`  - Type: ${content.type}`);
      console.log(`  - Stage: ${content.stage}`);
      console.log(`  - Description: ${content.description}`);
      console.log(`  - Featured: ${content.metadata.featured}`);
      console.log(`  - Status: ${content.metadata.status}`);
      console.log(`  - Technologies: ${content.metadata.technologies?.join(', ') || 'None'}`);
      console.log(`  - Tags: ${content.topics.join(', ') || 'None'}`);
      console.log(`  - Reading time: ${content.metadata.readingTime}`);
      console.log(`  - Content source: ${content.metadata.contentPath || 'root README.md'}`);
      
      console.log('\nContent preview (first 200 chars):');
      console.log(content.content.substring(0, 200) + '...');
    } else {
      console.log('❌ Failed to process content');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testFloatingDuckHouseV2();