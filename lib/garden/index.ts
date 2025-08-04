// The Digital Garden - Main site module
// The garden is where seeds (content from repositories) are planted and grow

import { discoverSeeds } from '@/lib/seed';
import type { SeedContent, ContentType, GrowthStage } from '@/lib/seed/types';
import { calculateGardenStats, type GardenStats } from './stats';
import { SeedSearcher } from './search';

export interface Garden {
  seeds: SeedContent[];
  stats: GardenStats;
}

export class DigitalGarden {
  private seeds: SeedContent[] = [];
  private searcher: SeedSearcher | null = null;
  
  async cultivate(): Promise<Garden> {
    try {
      // Discover all seeds
      const discovery = await discoverSeeds();
      this.seeds = discovery.seeds;
      this.searcher = new SeedSearcher(this.seeds);
      
      // Calculate garden statistics
      const stats = calculateGardenStats(this.seeds);
      
      return {
        seeds: this.seeds,
        stats,
      };
    } catch (error) {
      console.error('Failed to cultivate garden:', error);
      
      // Return empty garden on error
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