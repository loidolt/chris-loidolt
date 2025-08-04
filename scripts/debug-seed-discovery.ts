#!/usr/bin/env npx tsx

import { GitHubClient } from '@/lib/github/client';
import { SeedDiscovery } from '@/lib/seed/discovery';
import * as dotenv from 'dotenv';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

async function debugSeedDiscovery() {
  console.log('🔍 Debugging Seed Discovery\n');
  
  // Check environment variables
  console.log('1. Environment Variables:');
  console.log(`   GITHUB_TOKEN: ${process.env.GITHUB_TOKEN ? '✅ Set' : '❌ Not set'}`);
  console.log(`   GITHUB_OWNER: ${process.env.GITHUB_OWNER || '❌ Not set'}`);
  
  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER) {
    console.error('\n❌ Missing required environment variables');
    return;
  }
  
  try {
    // Test GitHub client
    console.log('\n2. Testing GitHub Client...');
    const client = new GitHubClient(
      process.env.GITHUB_TOKEN,
      process.env.GITHUB_OWNER
    );
    
    // Fetch user info to verify authentication
    const { data: user } = await client['octokit'].users.getAuthenticated();
    console.log(`   ✅ Authenticated as: ${user.login}`);
    console.log(`   ✅ Rate limit remaining: ${user.headers?.['x-ratelimit-remaining'] || 'unknown'}`);
    
    // Fetch repositories
    console.log('\n3. Fetching Repositories...');
    const repos = await client.fetchUserRepos();
    console.log(`   ✅ Found ${repos.length} repositories`);
    
    // Show first few repos
    console.log('\n   First 5 repositories:');
    repos.slice(0, 5).forEach(repo => {
      console.log(`   - ${repo.name} (${repo.private ? 'private' : 'public'})`);
    });
    
    // Look for repos with .seed directory
    console.log('\n4. Checking for .seed directories...');
    const discovery = new SeedDiscovery(client);
    
    // Check a specific repo if you know one has .seed
    const testRepo = 'floating-duck-house'; // Replace with your repo name
    console.log(`\n   Checking ${testRepo} for .seed directory...`);
    
    try {
      const metaYml = await client.fetchRepoContent(testRepo, '.seed/meta.yml');
      const metaJson = await client.fetchRepoContent(testRepo, '.seed/meta.json');
      
      if (metaYml) {
        console.log(`   ✅ Found .seed/meta.yml in ${testRepo}`);
        console.log('   Content preview:', metaYml.substring(0, 100) + '...');
      }
      if (metaJson) {
        console.log(`   ✅ Found .seed/meta.json in ${testRepo}`);
        console.log('   Content preview:', metaJson.substring(0, 100) + '...');
      }
      if (!metaYml && !metaJson) {
        console.log(`   ❌ No .seed/meta.yml or .seed/meta.json found in ${testRepo}`);
      }
    } catch (error: any) {
      console.log(`   ❌ Error checking ${testRepo}: ${error.message}`);
    }
    
    // Run full discovery
    console.log('\n5. Running Full Discovery...');
    const result = await discovery.discover();
    
    console.log(`\n📊 Discovery Results:`);
    console.log(`   Total repos checked: ${result.stats.totalRepos}`);
    console.log(`   Repos with .seed: ${result.stats.reposWithSeed}`);
    console.log(`   Successfully processed: ${result.stats.successfullyProcessed}`);
    console.log(`   Failed: ${result.stats.failed}`);
    console.log(`   Duration: ${result.stats.duration}ms`);
    
    if (result.seeds.length > 0) {
      console.log('\n✅ Found seeds:');
      result.seeds.forEach(seed => {
        console.log(`   - ${seed.slug}: ${seed.meta.title}`);
      });
    } else {
      console.log('\n⚠️  No seeds found');
    }
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => {
        console.log(`   - ${error.repository}: ${error.error}`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

debugSeedDiscovery();