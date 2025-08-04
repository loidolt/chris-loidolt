#!/usr/bin/env npx tsx

import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(process.cwd(), '.env.local') });

import { GitHubClient } from '@/lib/github/client';
import { CachedGitHubClient } from '@/lib/github/cached-client';
import { SeedDiscovery } from '@/lib/seed/discovery';

async function testCacheIssue() {
  console.log('🔍 Testing Cache Issue\n');
  
  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER) {
    console.error('❌ Missing required environment variables');
    return;
  }

  try {
    // Test 1: Without cache
    console.log('1. Testing WITHOUT cache...');
    const clientNoCache = new GitHubClient(
      process.env.GITHUB_TOKEN,
      process.env.GITHUB_OWNER
    );
    const discoveryNoCache = new SeedDiscovery(clientNoCache);
    const resultNoCache = await discoveryNoCache.discover();
    console.log(`   Seeds found: ${resultNoCache.seeds.length}`);
    if (resultNoCache.seeds.length > 0) {
      resultNoCache.seeds.forEach(seed => {
        console.log(`   - ${seed.slug}`);
      });
    }

    // Test 2: With cache
    console.log('\n2. Testing WITH cache...');
    const clientWithCache = new CachedGitHubClient(
      process.env.GITHUB_TOKEN,
      process.env.GITHUB_OWNER
    );
    const discoveryWithCache = new SeedDiscovery(clientWithCache);
    const resultWithCache = await discoveryWithCache.discover();
    console.log(`   Seeds found: ${resultWithCache.seeds.length}`);
    if (resultWithCache.seeds.length > 0) {
      resultWithCache.seeds.forEach(seed => {
        console.log(`   - ${seed.slug}`);
      });
    }

    // Test 3: Clear cache and try again
    console.log('\n3. Clearing cache and testing again...');
    console.log('   Current CACHE_ENABLED:', process.env.CACHE_ENABLED);
    console.log('   Current CACHE_TTL:', process.env.CACHE_TTL);
    
    // Force clear cache by creating a new instance
    const freshClient = new CachedGitHubClient(
      process.env.GITHUB_TOKEN,
      process.env.GITHUB_OWNER,
      1 // Very short TTL to force refresh
    );
    const freshDiscovery = new SeedDiscovery(freshClient);
    const freshResult = await freshDiscovery.discover();
    console.log(`   Seeds found after cache clear: ${freshResult.seeds.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testCacheIssue();