import { config } from 'dotenv';
config({ path: '.env.local' });
import { GitHubClient } from '../lib/github/client';
import { ContentProcessor } from '../lib/content/processor';
import { DiscoveryEngine } from '../lib/discovery/engine';

async function testFloatingDuckHouse() {
  console.log('🦆 Testing floating-duck-house repository...');
  
  const client = new GitHubClient(
    process.env.GITHUB_TOKEN!,
    process.env.GITHUB_OWNER!
  );
  
  const processor = new ContentProcessor(client);
  const discovery = new DiscoveryEngine(client);
  
  try {
    // First, check if we can access the repo directly
    console.log('\n1. Fetching floating-duck-house repository...');
    const repos = await client.fetchUserRepos();
    const floatingDuckHouse = repos.find(r => r.name === 'floating-duck-house');
    
    if (!floatingDuckHouse) {
      console.log('❌ Repository not found in user repos');
      return;
    }
    
    console.log('✅ Found repository:');
    console.log(`   - Name: ${floatingDuckHouse.name}`);
    console.log(`   - Description: ${floatingDuckHouse.description}`);
    console.log(`   - Topics: ${floatingDuckHouse.topics.join(', ') || 'None'}`);
    console.log(`   - URL: ${floatingDuckHouse.html_url}`);
    
    // Check for .garden directory
    console.log('\n2. Checking for .garden/meta.yml...');
    const metaContent = await client.fetchRepoContent('floating-duck-house', '.garden/meta.yml');
    
    if (metaContent) {
      console.log('✅ Found .garden/meta.yml');
      console.log('   First 500 chars:');
      console.log(metaContent.substring(0, 500));
    } else {
      console.log('❌ No .garden/meta.yml found');
    }
    
    // Test discovery
    console.log('\n3. Testing discovery engine...');
    const discovered = await discovery.discover();
    const found = discovered.find(r => r.name === 'floating-duck-house');
    
    if (found) {
      console.log('✅ Repository discovered by engine');
    } else {
      console.log('❌ Repository NOT discovered by engine');
      console.log('   Likely reason: Missing required topics (garden, project, note, writing, or experiment)');
    }
    
    // Process the content
    console.log('\n4. Processing garden content...');
    const content = await processor.processRepository(floatingDuckHouse);
    
    if (content) {
      console.log('✅ Content processed successfully:');
      console.log(`   - Title: ${content.title}`);
      console.log(`   - Type: ${content.type}`);
      console.log(`   - Stage: ${content.stage}`);
      console.log(`   - Description: ${content.description}`);
      console.log(`   - Tags: ${content.topics.join(', ')}`);
      console.log(`   - Featured: ${content.metadata.featured}`);
    } else {
      console.log('❌ Failed to process content');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testFloatingDuckHouse();