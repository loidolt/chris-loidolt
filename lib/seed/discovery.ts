import type { GitHubClient } from '@/lib/github/client';
import type { Repository } from '@/types';
import type { SeedContent, SeedDiscoveryResult } from './types';
import { SeedProcessor } from './processor';

export interface SeedDiscoveryConfig {
  // Check for .seed directory
  checkSeedDirectory: boolean;
  
  // Repository filters
  includePrivate: boolean;
  excludeArchived: boolean;
  excludeForks: boolean;
  
  // Pattern-based exclusions
  excludePatterns: RegExp[];
  excludeRepos: string[];
  
  // Performance
  parallel: boolean;
  maxConcurrent: number;
}

export const defaultConfig: SeedDiscoveryConfig = {
  checkSeedDirectory: true,
  includePrivate: false,
  excludeArchived: true,
  excludeForks: true,
  excludePatterns: [/^\./],  // Exclude dotfiles
  excludeRepos: ['.github', 'dotfiles'],
  parallel: true,
  maxConcurrent: 5,
};

export class SeedDiscovery {
  private client: any; // Accept both GitHubClient and CachedGitHubClient
  private processor: SeedProcessor;
  private config: SeedDiscoveryConfig;
  
  constructor(
    client: any, // Accept both GitHubClient and CachedGitHubClient
    config: Partial<SeedDiscoveryConfig> = {}
  ) {
    this.client = client;
    this.processor = new SeedProcessor(client);
    this.config = { ...defaultConfig, ...config };
  }
  
  async discover(): Promise<SeedDiscoveryResult> {
    const startTime = Date.now();
    const errors: SeedDiscoveryResult['errors'] = [];
    
    try {
      // Fetch all repositories
      const allRepos = await this.client.fetchUserRepos();
      
      // Apply filters
      const filteredRepos = this.filterRepositories(allRepos);
      
      // Check for seed content
      const reposWithSeed = await this.findReposWithSeed(filteredRepos);
      
      // Process seed content
      const seeds = await this.processSeedContent(reposWithSeed, errors);
      
      // Return results
      return {
        seeds,
        errors,
        stats: {
          totalRepos: allRepos.length,
          reposWithSeed: reposWithSeed.length,
          successfullyProcessed: seeds.length,
          failed: errors.length,
          duration: Date.now() - startTime,
        },
      };
    } catch (error) {
      throw new Error(`Discovery failed: ${error}`);
    }
  }
  
  private filterRepositories(repos: Repository[]): Repository[] {
    return repos.filter(repo => {
      // Apply exclusion rules
      if (!this.config.includePrivate && repo.private) return false;
      if (this.config.excludeArchived && repo.archived) return false;
      if (this.config.excludeForks && repo.fork) return false;
      
      // Check repo name exclusions
      if (this.config.excludeRepos.includes(repo.name)) return false;
      
      // Check pattern exclusions
      if (this.config.excludePatterns.some(pattern => pattern.test(repo.name))) {
        return false;
      }
      
      return true;
    });
  }
  
  private async findReposWithSeed(repos: Repository[]): Promise<Repository[]> {
    if (!this.config.checkSeedDirectory) return repos;
    
    const checks = repos.map(async (repo) => {
      const hasSeed = await this.hasSeedContent(repo);
      return hasSeed ? repo : null;
    });
    
    const results = await Promise.all(checks);
    return results.filter((repo): repo is Repository => repo !== null);
  }
  
  private async hasSeedContent(repo: Repository): Promise<boolean> {
    try {
      // Check for .seed/meta.yml or .seed/meta.json
      const [yml, json] = await Promise.all([
        this.client.fetchRepoContent(repo.name, '.seed/meta.yml'),
        this.client.fetchRepoContent(repo.name, '.seed/meta.json'),
      ]);
      
      return !!(yml || json);
    } catch {
      return false;
    }
  }
  
  private async processSeedContent(
    repos: Repository[],
    errors: SeedDiscoveryResult['errors']
  ): Promise<SeedContent[]> {
    const processRepo = async (repo: Repository): Promise<SeedContent | null> => {
      try {
        return await this.processor.process(repo);
      } catch (error) {
        errors.push({
          repository: repo.name,
          error: error instanceof Error ? error.message : String(error),
        });
        return null;
      }
    };
    
    if (this.config.parallel) {
      // Process in batches for better performance
      const seeds: SeedContent[] = [];
      const batchSize = this.config.maxConcurrent;
      
      for (let i = 0; i < repos.length; i += batchSize) {
        const batch = repos.slice(i, i + batchSize);
        const results = await Promise.all(batch.map(processRepo));
        seeds.push(...results.filter((s): s is SeedContent => s !== null));
      }
      
      return seeds;
    } else {
      // Process sequentially
      const seeds: SeedContent[] = [];
      for (const repo of repos) {
        const seed = await processRepo(repo);
        if (seed) seeds.push(seed);
      }
      return seeds;
    }
  }
  
  // Utility method to get a single repository's seed content
  async discoverOne(repoName: string): Promise<SeedContent | null> {
    const repos = await this.client.fetchUserRepos();
    const repo = repos.find((r: Repository) => r.name === repoName);
    
    if (!repo) {
      throw new Error(`Repository '${repoName}' not found`);
    }
    
    const hasSeed = await this.hasSeedContent(repo);
    if (!hasSeed) {
      throw new Error(`Repository '${repoName}' has no .seed directory`);
    }
    
    return this.processor.process(repo);
  }
}