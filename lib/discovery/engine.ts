import { GitHubClient } from '@/lib/github/client';
import { discoveryConfig } from '@/config/discovery';
import type { Repository } from '@/types';

export class DiscoveryEngine {
  private client: GitHubClient;

  constructor(client: GitHubClient) {
    this.client = client;
  }

  async discover(): Promise<Repository[]> {
    const repos = await this.fetchAllRepos();
    return this.filterRepos(repos);
  }

  private async fetchAllRepos(): Promise<Repository[]> {
    const { includeOrgs } = discoveryConfig.sources.github;
    
    const userRepos = await this.client.fetchUserRepos();
    
    const orgRepos = await Promise.all(
      includeOrgs.map(org => this.client.fetchOrgRepos(org))
    );
    
    return [...userRepos, ...orgRepos.flat()];
  }

  private filterRepos(repos: Repository[]): Repository[] {
    return repos.filter(repo => {
      // Apply include rules
      if (!this.matchesIncludeRules(repo)) return false;
      
      // Apply exclude rules
      if (this.matchesExcludeRules(repo)) return false;
      
      return true;
    });
  }

  private matchesIncludeRules(repo: Repository): boolean {
    const { topics, visibility } = discoveryConfig.rules.include;
    
    // Check topics
    if (topics.any.length > 0) {
      const hasAnyTopic = topics.any.some(topic => 
        repo.topics.includes(topic)
      );
      if (!hasAnyTopic) return false;
    }
    
    if (topics.all.length > 0) {
      const hasAllTopics = topics.all.every(topic => 
        repo.topics.includes(topic)
      );
      if (!hasAllTopics) return false;
    }
    
    // Check visibility
    if (visibility.length > 0 && !visibility.includes('public')) {
      return false;
    }
    
    return true;
  }

  private matchesExcludeRules(repo: Repository): boolean {
    const { topics, repos, patterns } = discoveryConfig.rules.exclude;
    
    // Check excluded topics
    if (topics.some(topic => repo.topics.includes(topic))) {
      return true;
    }
    
    // Check excluded repos
    if (repos.includes(repo.name)) {
      return true;
    }
    
    // Check patterns
    if (patterns.some(pattern => pattern.test(repo.name))) {
      return true;
    }
    
    return false;
  }

  categorize(repos: Repository[]): Record<string, Repository[]> {
    const categories: Record<string, Repository[]> = {
      all: repos,
    };
    
    Object.entries(discoveryConfig.rules.categorize).forEach(([name, rule]) => {
      categories[name] = repos.filter(repo => 
        rule.topics.some(topic => repo.topics.includes(topic))
      );
    });
    
    return categories;
  }
}