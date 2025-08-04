import type { SeedContent, ContentType, GrowthStage } from '@/lib/seed/types';

export interface SearchOptions {
  type?: ContentType;
  stage?: GrowthStage;
  tags?: string[];
  featured?: boolean;
  query?: string;
}

export class SeedSearcher {
  private seeds: SeedContent[];
  
  constructor(seeds: SeedContent[]) {
    this.seeds = seeds;
  }
  
  search(options: SearchOptions): SeedContent[] {
    let results = [...this.seeds];
    
    if (options.type) {
      results = results.filter(seed => seed.meta.type === options.type);
    }
    
    if (options.stage) {
      results = results.filter(seed => seed.meta.stage === options.stage);
    }
    
    if (options.featured !== undefined) {
      results = results.filter(seed => seed.meta.featured === options.featured);
    }
    
    if (options.tags && options.tags.length > 0) {
      results = results.filter(seed => 
        options.tags!.some(tag => seed.meta.tags?.includes(tag))
      );
    }
    
    if (options.query) {
      const query = options.query.toLowerCase();
      results = results.filter(seed => 
        seed.meta.title.toLowerCase().includes(query) ||
        seed.meta.description?.toLowerCase().includes(query) ||
        seed.content.toLowerCase().includes(query)
      );
    }
    
    return results;
  }
  
  findByType(type: ContentType): SeedContent[] {
    return this.seeds.filter(seed => seed.meta.type === type);
  }
  
  findByStage(stage: GrowthStage): SeedContent[] {
    return this.seeds.filter(seed => seed.meta.stage === stage);
  }
  
  findFeatured(): SeedContent[] {
    return this.seeds.filter(seed => seed.meta.featured === true);
  }
  
  findByTag(tag: string): SeedContent[] {
    return this.seeds.filter(seed => seed.meta.tags?.includes(tag));
  }
  
  findByTags(tags: string[]): SeedContent[] {
    return this.seeds.filter(seed => 
      tags.every(tag => seed.meta.tags?.includes(tag))
    );
  }
  
  findBySlug(slug: string): SeedContent | undefined {
    return this.seeds.find(seed => seed.slug === slug);
  }
  
  findRelated(seed: SeedContent, limit: number = 5): SeedContent[] {
    if (!seed.meta.tags || seed.meta.tags.length === 0) {
      return [];
    }
    
    // Score other seeds by tag overlap
    const scored = this.seeds
      .filter(s => s.slug !== seed.slug)
      .map(s => {
        const tagOverlap = s.meta.tags?.filter(tag => 
          seed.meta.tags!.includes(tag)
        ).length || 0;
        
        return { seed: s, score: tagOverlap };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);
    
    return scored.slice(0, limit).map(({ seed }) => seed);
  }
}