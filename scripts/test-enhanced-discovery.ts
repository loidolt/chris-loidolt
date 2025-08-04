import { GitHubClient } from '../lib/github/client';
import { EnhancedDiscoveryEngine } from '../lib/discovery/enhanced-engine';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function testEnhancedDiscovery() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;

  if (!token || !owner) {
    console.error('Missing GITHUB_TOKEN or GITHUB_OWNER environment variables');
    process.exit(1);
  }

  console.log('🔍 Testing Enhanced Discovery Engine...\n');

  const client = new GitHubClient(token, owner);
  const discovery = new EnhancedDiscoveryEngine(client);

  try {
    // Test 1: Discover repositories
    console.log('1. Discovering repositories...');
    const allRepos = await client.fetchUserRepos();
    console.log(`   📚 Total repositories: ${allRepos.length}`);

    const discoveredRepos = await discovery.discover();
    console.log(`   ✅ Repositories discovered: ${discoveredRepos.length}`);
    console.log(`   🔧 Discovery mode: ${discovery.getDiscoveryMode()}`);

    // Show sample of discovered repos
    if (discoveredRepos.length > 0) {
      console.log('\n   Sample discovered repositories:');
      discoveredRepos.slice(0, 5).forEach(repo => {
        console.log(`   - ${repo.name}`);
        if (repo.description) {
          console.log(`     ${repo.description.substring(0, 80)}...`);
        }
        if (repo.language) {
          console.log(`     Language: ${repo.language}`);
        }
      });
    }

    // Test 2: Categorization
    console.log('\n2. Testing auto-categorization...');
    const categories = discovery.categorize(discoveredRepos);
    
    Object.entries(categories).forEach(([category, repos]) => {
      if (category !== 'all' && repos.length > 0) {
        console.log(`   📂 ${category}: ${repos.length} repositories`);
        // Show first 3 repos in each category
        repos.slice(0, 3).forEach(repo => {
          console.log(`      - ${repo.name}`);
        });
      }
    });

    // Test 3: Language distribution
    console.log('\n3. Language distribution:');
    const languageCounts: Record<string, number> = {};
    discoveredRepos.forEach(repo => {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
    });
    
    Object.entries(languageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([lang, count]) => {
        console.log(`   - ${lang}: ${count} repos`);
      });

    // Test 4: Recent activity
    console.log('\n4. Recently updated repositories:');
    const recentRepos = [...discoveredRepos]
      .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
      .slice(0, 5);
    
    recentRepos.forEach(repo => {
      const lastUpdate = new Date(repo.pushed_at);
      const daysAgo = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`   - ${repo.name} (updated ${daysAgo} days ago)`);
    });

    console.log('\n✅ Enhanced discovery test completed successfully!');
    
  } catch (error) {
    console.error('❌ Enhanced discovery test failed:', error);
    process.exit(1);
  }
}

testEnhancedDiscovery();