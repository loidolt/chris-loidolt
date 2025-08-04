#!/usr/bin/env npx tsx

import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(process.cwd(), '.env.local') });

import { GitHubClient } from '@/lib/github/client';
import { SeedDiscovery } from '@/lib/seed/discovery';
import { discoverSeeds } from '@/lib/seed';

async function debugSeedDiscovery() {
  console.log('🔍 Debugging Seed Discovery System\n');
  
  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER) {
    console.error('❌ Missing required environment variables: GITHUB_TOKEN and GITHUB_OWNER');
    return;
  }

  console.log(`GitHub Owner: ${process.env.GITHUB_OWNER}\n`);

  try {
    // Create client
    const client = new GitHubClient(
      process.env.GITHUB_TOKEN,
      process.env.GITHUB_OWNER
    );

    // 1. List all repositories
    console.log('1. Fetching all repositories...');
    const allRepos = await client.fetchUserRepos();
    console.log(`✅ Found ${allRepos.length} total repositories\n`);

    // 2. Check each repo for .seed directory
    console.log('2. Checking for .seed directories...');
    const reposWithSeed: string[] = [];
    const reposWithoutSeed: string[] = [];

    for (const repo of allRepos) {
      try {
        const [yml, json] = await Promise.all([
          client.fetchRepoContent(repo.name, '.seed/meta.yml'),
          client.fetchRepoContent(repo.name, '.seed/meta.json'),
        ]);
        
        if (yml || json) {
          reposWithSeed.push(repo.name);
          console.log(`  ✅ ${repo.name} - has .seed/${yml ? 'meta.yml' : 'meta.json'}`);
        } else {
          reposWithoutSeed.push(repo.name);
        }
      } catch (error) {
        reposWithoutSeed.push(repo.name);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  - Repos with .seed: ${reposWithSeed.length}`);
    console.log(`  - Repos without .seed: ${reposWithoutSeed.length}`);

    if (reposWithSeed.length > 0) {
      console.log(`\n📁 Repositories with .seed directory:`);
      reposWithSeed.forEach(name => console.log(`  - ${name}`));
    }

    // 3. Run full discovery
    console.log('\n3. Running full seed discovery...');
    const discovery = new SeedDiscovery(client);
    const result = await discovery.discover();
    
    console.log(`\n✅ Discovery Results:`);
    console.log(`  - Seeds found: ${result.seeds.length}`);
    console.log(`  - Errors: ${result.errors.length}`);
    console.log(`  - Duration: ${result.stats.duration}ms`);

    if (result.seeds.length > 0) {
      console.log(`\n🌱 Seeds discovered:`);
      result.seeds.forEach(seed => {
        console.log(`  - ${seed.slug}: "${seed.meta.title}" (${seed.meta.type}, ${seed.meta.stage})`);
      });
    }

    if (result.errors.length > 0) {
      console.log(`\n❌ Errors during discovery:`);
      result.errors.forEach(err => {
        console.log(`  - ${err.repository}: ${err.error}`);
      });
    }

    // 4. Test the main discoverSeeds function
    console.log('\n4. Testing main discoverSeeds function...');
    const mainResult = await discoverSeeds();
    console.log(`  - Seeds found: ${mainResult.seeds.length}`);

  } catch (error) {
    console.error('❌ Error during discovery:', error);
  }
}

debugSeedDiscovery();