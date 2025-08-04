import { GitHubClient } from '../lib/github/client';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function comprehensiveTest() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;

  if (!token || !owner) {
    console.error('Missing GITHUB_TOKEN or GITHUB_OWNER environment variables');
    process.exit(1);
  }

  const client = new GitHubClient(token, owner);

  try {
    console.log('🧪 Running comprehensive GitHub client tests...\n');

    // Test 1: Fetch user repositories
    console.log('1. Testing fetchUserRepos()...');
    const repos = await client.fetchUserRepos();
    console.log(`   ✅ Found ${repos.length} repositories`);
    
    // Find a repo with content to test
    const repoWithReadme = repos.find(r => r.name === 'automatic-winding-machine') || repos[0];
    console.log(`   📦 Using repo "${repoWithReadme.name}" for content tests`);

    // Test 2: Fetch repository content (README)
    console.log('\n2. Testing fetchRepoContent() for README...');
    const readme = await client.fetchRepoContent(repoWithReadme.name, 'README.md');
    if (readme) {
      console.log(`   ✅ README.md found (${readme.length} characters)`);
      console.log(`   📄 First 100 chars: ${readme.substring(0, 100)}...`);
    } else {
      console.log('   ⚠️  No README.md found');
    }

    // Test 3: Fetch repository tree
    console.log('\n3. Testing fetchRepoTree()...');
    const tree = await client.fetchRepoTree(repoWithReadme.name);
    console.log(`   ✅ Repository tree fetched (${tree.length} items)`);
    const fileTypes = tree.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log(`   📊 Tree composition:`, fileTypes);

    // Test 4: Check topics on repositories
    console.log('\n4. Analyzing repository topics...');
    const reposWithTopics = repos.filter(r => r.topics && r.topics.length > 0);
    console.log(`   ✅ ${reposWithTopics.length} repos have topics`);
    if (reposWithTopics.length > 0) {
      console.log('   📌 Sample repos with topics:');
      reposWithTopics.slice(0, 3).forEach(repo => {
        console.log(`      - ${repo.name}: ${repo.topics.join(', ')}`);
      });
    }

    // Test 5: Rate limit check
    console.log('\n5. Checking API rate limits...');
    const { data: rateLimit } = await client['octokit'].rateLimit.get();
    console.log(`   ✅ Rate limit status:`);
    console.log(`      - Limit: ${rateLimit.rate.limit}`);
    console.log(`      - Remaining: ${rateLimit.rate.remaining}`);
    console.log(`      - Reset: ${new Date(rateLimit.rate.reset * 1000).toLocaleString()}`);

    console.log('\n🎉 All tests passed! GitHub client is fully functional.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

comprehensiveTest();