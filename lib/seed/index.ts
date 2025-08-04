// Seed system - Clean, simple discovery for digital garden content

export * from './types';
export * from './discovery';
export * from './processor';

import { GitHubClient } from '@/lib/github/client';
import { CachedGitHubClient } from '@/lib/github/cached-client';
import { SeedDiscovery, type SeedDiscoveryConfig } from './discovery';
import type { SeedDiscoveryResult } from './types';

// Main entry point for seed discovery
export async function discoverSeeds(
  config?: Partial<SeedDiscoveryConfig>
): Promise<SeedDiscoveryResult> {
  const cacheEnabled = process.env.CACHE_ENABLED !== 'false';
  const cacheTTL = process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : undefined;
  
  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER) {
    throw new Error('Missing required environment variables: GITHUB_TOKEN and GITHUB_OWNER');
  }
  
  console.log('GitHub Owner from env:', process.env.GITHUB_OWNER); // Debug log
  
  const client = cacheEnabled
    ? new CachedGitHubClient(
        process.env.GITHUB_TOKEN,
        process.env.GITHUB_OWNER,
        cacheTTL
      )
    : new GitHubClient(
        process.env.GITHUB_TOKEN,
        process.env.GITHUB_OWNER
      );
  
  const discovery = new SeedDiscovery(client, config);
  return discovery.discover();
}

// Discover a single repository's seed content
export async function discoverSeed(repoName: string) {
  const cacheEnabled = process.env.CACHE_ENABLED !== 'false';
  const cacheTTL = process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : undefined;
  
  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER) {
    throw new Error('Missing required environment variables: GITHUB_TOKEN and GITHUB_OWNER');
  }
  
  const client = cacheEnabled
    ? new CachedGitHubClient(
        process.env.GITHUB_TOKEN,
        process.env.GITHUB_OWNER,
        cacheTTL
      )
    : new GitHubClient(
        process.env.GITHUB_TOKEN,
        process.env.GITHUB_OWNER
      );
  
  const discovery = new SeedDiscovery(client);
  return discovery.discoverOne(repoName);
}