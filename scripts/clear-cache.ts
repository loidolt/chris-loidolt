#!/usr/bin/env npx tsx

import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(process.cwd(), '.env.local') });

import { CacheManager } from '@/lib/cache/manager';

async function clearCache() {
  console.log('🧹 Clearing cache...\n');
  
  const cache = new CacheManager();
  await cache.clear();
  
  console.log('✅ Cache cleared successfully');
}

clearCache();