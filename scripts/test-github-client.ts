import { GitHubClient } from '../lib/github/client';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function testGitHubClient() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;

  if (!token || !owner) {
    console.error('Missing GITHUB_TOKEN or GITHUB_OWNER environment variables');
    process.exit(1);
  }

  console.log('Environment check:');
  console.log(`- GITHUB_OWNER: ${owner}`);
  console.log(`- GITHUB_TOKEN: ${token.substring(0, 10)}...${token.substring(token.length - 4)}`);

  const client = new GitHubClient(token, owner);

  try {
    console.log('\nTesting GitHub client...');
    console.log(`Fetching repositories for user: ${owner}`);
    
    const repos = await client.fetchUserRepos();
    console.log(`Found ${repos.length} repositories`);
    
    if (repos.length > 0) {
      console.log('\nFirst 5 repositories:');
      repos.slice(0, 5).forEach(repo => {
        console.log(`- ${repo.name}: ${repo.description || 'No description'}`);
        console.log(`  Topics: ${repo.topics.join(', ') || 'None'}`);
      });
    }

    console.log('\n✅ GitHub client test successful!');
  } catch (error) {
    console.error('❌ GitHub client test failed:', error);
    process.exit(1);
  }
}

testGitHubClient();