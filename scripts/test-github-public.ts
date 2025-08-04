import { Octokit } from '@octokit/rest';

async function testPublicAPI() {
  console.log('Testing GitHub API without authentication...\n');
  
  const octokit = new Octokit();
  
  try {
    // Test 1: Fetch a public user
    console.log('1. Fetching public user info for "loidolt"...');
    const { data: user } = await octokit.users.getByUsername({
      username: 'loidolt'
    });
    console.log(`✅ User found: ${user.name || user.login}`);
    console.log(`   - Public repos: ${user.public_repos}`);
    console.log(`   - Followers: ${user.followers}`);
    
    // Test 2: Fetch public repos
    console.log('\n2. Fetching public repositories...');
    const { data: repos } = await octokit.repos.listForUser({
      username: 'loidolt',
      per_page: 5,
      sort: 'updated'
    });
    
    console.log(`✅ Found ${repos.length} repositories (showing first 5)`);
    repos.forEach(repo => {
      console.log(`   - ${repo.name}: ${repo.description || 'No description'}`);
      if (repo.topics && repo.topics.length > 0) {
        console.log(`     Topics: ${repo.topics.join(', ')}`);
      }
    });
    
    console.log('\n✅ All tests passed! GitHub API is accessible.');
    console.log('\nNOTE: To use authenticated requests and access private repos,');
    console.log('you need to create a GitHub Personal Access Token at:');
    console.log('https://github.com/settings/tokens/new');
    console.log('Then update the GITHUB_TOKEN in your .env.local file');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testPublicAPI();