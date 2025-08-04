import { GitHubClient } from '@/lib/github/client';
import { discoveryConfig } from '@/config/discovery';
import { discoveryFallbackConfig } from '@/config/discovery-fallback';
import type { Repository } from '@/types';

export class EnhancedDiscoveryEngine {
  private client: GitHubClient;
  private useFallback: boolean = false;

  constructor(client: GitHubClient) {
    this.client = client;
  }

  async discover(): Promise<Repository[]> {
    const repos = await this.fetchAllRepos();
    
    // First try with topic-based discovery
    let discoveredRepos = this.filterReposByTopics(repos);
    
    // If no repos found with topics, use fallback
    if (discoveredRepos.length === 0) {
      console.log('No repos found with topics, using fallback discovery...');
      this.useFallback = true;
      discoveredRepos = this.filterReposFallback(repos);
    }
    
    return discoveredRepos;
  }

  private async fetchAllRepos(): Promise<Repository[]> {
    const { includeOrgs } = discoveryConfig.sources.github;
    
    const userRepos = await this.client.fetchUserRepos();
    
    const orgRepos = await Promise.all(
      includeOrgs.map(org => this.client.fetchOrgRepos(org))
    );
    
    return [...userRepos, ...orgRepos.flat()];
  }

  private filterReposByTopics(repos: Repository[]): Repository[] {
    return repos.filter(repo => {
      // Apply include rules
      if (!this.matchesIncludeRules(repo)) return false;
      
      // Apply exclude rules
      if (this.matchesExcludeRules(repo)) return false;
      
      return true;
    });
  }

  private filterReposFallback(repos: Repository[]): Repository[] {
    const { exclude } = discoveryFallbackConfig.rules;
    
    return repos.filter(repo => {
      // Check excluded patterns
      if (exclude.patterns.some(pattern => pattern.test(repo.name))) {
        return false;
      }
      
      // Check excluded repos
      if (exclude.repos.includes(repo.name)) {
        return false;
      }
      
      // Include all others
      return true;
    });
  }

  private matchesIncludeRules(repo: Repository): boolean {
    const { topics } = discoveryConfig.rules.include;
    
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
    
    if (this.useFallback) {
      // Use auto-categorization
      const { byName, byLanguage } = discoveryFallbackConfig.autoCategorize;
      
      // Categorize by name patterns
      Object.entries(byName).forEach(([category, pattern]) => {
        categories[category] = repos.filter(repo => pattern.test(repo.name));
      });
      
      // Categorize by language
      Object.entries(byLanguage).forEach(([category, languages]) => {
        categories[category] = repos.filter(repo => 
          repo.language && languages.includes(repo.language)
        );
      });
    } else {
      // Use topic-based categorization
      Object.entries(discoveryConfig.rules.categorize).forEach(([name, rule]) => {
        categories[name] = repos.filter(repo => 
          rule.topics.some(topic => repo.topics.includes(topic))
        );
      });
    }
    
    return categories;
  }

  getDiscoveryMode(): string {
    return this.useFallback ? 'fallback' : 'topic-based';
  }
}