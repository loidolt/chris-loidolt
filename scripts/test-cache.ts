#!/usr/bin/env npx tsx

import { CacheManager } from '../lib/cache/manager';
import { CachedGitHubClient } from '../lib/github/cached-client';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function testCache() {
  console.log('🧪 Testing cache implementation...\n');

  // Test 1: Basic cache operations
  console.log('Test 1: Basic cache operations');
  const cache = new CacheManager(5000); // 5 second TTL for testing
  
  await cache.set('test-key', { data: 'test-value' });
  const cached = await cache.get('test-key');
  console.log('✅ Set and get:', cached);
  
  // Test 2: TTL expiration
  console.log('\nTest 2: TTL expiration');
  await new Promise(resolve => setTimeout(resolve, 6000));
  const expired = await cache.get('test-key');
  console.log('✅ Expired cache:', expired === null ? 'null (as expected)' : 'ERROR: not null');
  
  // Test 3: GitHub client caching
  console.log('\nTest 3: GitHub client caching');
  const client = new CachedGitHubClient(
    process.env.GITHUB_TOKEN!,
    process.env.GITHUB_OWNER!,
    30000 // 30 second TTL
  );
  
  console.time('First fetch (uncached)');
  const repos1 = await client.fetchUserRepos();
  console.timeEnd('First fetch (uncached)');
  console.log(`Found ${repos1.length} repositories`);
  
  console.time('Second fetch (cached)');
  const repos2 = await client.fetchUserRepos();
  console.timeEnd('Second fetch (cached)');
  console.log(`Found ${repos2.length} repositories (from cache)`);
  
  // Test 4: Check cache files
  console.log('\nTest 4: Cache file system');
  const fs = await import('fs/promises');
  const path = await import('path');
  
  try {
    const cacheDir = path.join(process.cwd(), '.cache');
    const files = await fs.readdir(cacheDir);
    console.log(`✅ Cache files created: ${files.length} files`);
    files.forEach(file => console.log(`  - ${file}`));
  } catch (error) {
    console.log('❌ No cache directory found');
  }
  
  // Clean up
  await cache.clear();
  console.log('\n✅ Cache cleared');
}

testCache().catch(console.error);