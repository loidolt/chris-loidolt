import { GitHubClient } from '../lib/github/client';
import { DiscoveryEngine } from '../lib/discovery/engine';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function testDiscovery() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;

  if (!token || !owner) {
    console.error('Missing GITHUB_TOKEN or GITHUB_OWNER environment variables');
    process.exit(1);
  }

  console.log('🔍 Testing Discovery Engine...\n');

  const client = new GitHubClient(token, owner);
  const discovery = new DiscoveryEngine(client);

  try {
    // Test 1: Discover all repositories
    console.log('1. Discovering repositories...');
    const allRepos = await client.fetchUserRepos();
    console.log(`   📚 Total repositories: ${allRepos.length}`);

    // Test 2: Apply discovery filters
    console.log('\n2. Applying discovery filters...');
    const discoveredRepos = await discovery.discover();
    console.log(`   ✅ Repositories after filtering: ${discoveredRepos.length}`);

    // Show excluded repos
    const excludedRepos = allRepos.filter(
      repo => !discoveredRepos.find(dr => dr.name === repo.name)
    );
    if (excludedRepos.length > 0) {
      console.log(`   ❌ Excluded ${excludedRepos.length} repositories:`);
      excludedRepos.slice(0, 10).forEach(repo => {
        console.log(`      - ${repo.name} (reason: likely no matching topics or excluded pattern)`);
      });
      if (excludedRepos.length > 10) {
        console.log(`      ... and ${excludedRepos.length - 10} more`);
      }
    }

    // Test 3: Categorization
    console.log('\n3. Testing categorization...');
    const categories = discovery.categorize(discoveredRepos);
    Object.entries(categories).forEach(([category, repos]) => {
      if (category !== 'all') {
        console.log(`   📂 ${category}: ${repos.length} repositories`);
      }
    });

    // Test 4: Topic analysis
    console.log('\n4. Analyzing topics across all repositories...');
    const topicCounts: Record<string, number> = {};
    allRepos.forEach(repo => {
      repo.topics.forEach(topic => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
    });
    
    const sortedTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    
    if (sortedTopics.length > 0) {
      console.log('   📌 Top topics found:');
      sortedTopics.forEach(([topic, count]) => {
        console.log(`      - ${topic}: ${count} repos`);
      });
    } else {
      console.log('   ⚠️  No topics found in any repositories');
      console.log('   💡 Consider adding topics to your repositories for better discovery');
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    console.log('   To include repositories in your digital garden, add one of these topics:');
    console.log('   - garden, project, note, writing, experiment');
    console.log('   To categorize them further, use:');
    console.log('   - featured (for featured projects)');
    console.log('   - portfolio (for portfolio items)');
    console.log('   - draft (for work-in-progress)');
    
  } catch (error) {
    console.error('❌ Discovery test failed:', error);
    process.exit(1);
  }
}

testDiscovery();