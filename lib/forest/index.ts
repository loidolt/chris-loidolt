// The Digital Forest - Main site module
// The forest is where seeds (content from repositories) grow into trees

import { discoverSeeds } from '@/lib/seed';
import type { SeedContent, ContentType, GrowthStage } from '@/lib/seed/types';
import { calculateForestStats, type ForestStats } from './stats';
import { SeedSearcher } from './search';

export interface Forest {
  seeds: SeedContent[];
  stats: ForestStats;
}

export class DigitalForest {
  private seeds: SeedContent[] = [];
  private searcher: SeedSearcher | null = null;
  
  async cultivate(): Promise<Forest> {
    try {
      // Discover all seeds
      const discovery = await discoverSeeds();
      this.seeds = discovery.seeds;
      this.searcher = new SeedSearcher(this.seeds);
      
      // Calculate forest statistics
      const stats = calculateForestStats(this.seeds);
      
      return {
        seeds: this.seeds,
        stats,
      };
    } catch (error) {
      console.error('Failed to cultivate forest:', error);
      
      // Return empty forest on error
      return {
        seeds: [],
        stats: {
          totalSeeds: 0,
          byType: {},
          byStage: {},
          lastUpdated: new Date(),
        },
      };
    }
  }
  
  // Delegated search methods
  findByType(type: ContentType): SeedContent[] {
    if (!this.searcher) return [];
    return this.searcher.findByType(type);
  }
  
  findByStage(stage: GrowthStage): SeedContent[] {
    if (!this.searcher) return [];
    return this.searcher.findByStage(stage);
  }
  
  findFeatured(): SeedContent[] {
    if (!this.searcher) return [];
    return this.searcher.findFeatured();
  }
  
  findByTag(tag: string): SeedContent[] {
    if (!this.searcher) return [];
    return this.searcher.findByTag(tag);
  }
  
  getSeed(slug: string): SeedContent | undefined {
    if (!this.searcher) return undefined;
    return this.searcher.findBySlug(slug);
  }
  
  // New search capabilities
  search(options: Parameters<SeedSearcher['search']>[0]): SeedContent[] {
    if (!this.searcher) return [];
    return this.searcher.search(options);
  }
  
  findRelated(seed: SeedContent, limit?: number): SeedContent[] {
    if (!this.searcher) return [];
    return this.searcher.findRelated(seed, limit);
  }
  
  // Getter for all seeds
  getAllSeeds(): SeedContent[] {
    return this.seeds;
  }
}