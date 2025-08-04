import type { SeedContent } from '@/lib/seed/types';

export interface ForestStats {
  totalSeeds: number;
  byType: Record<string, number>;
  byStage: Record<string, number>;
  lastUpdated: Date;
}

export function calculateForestStats(seeds: SeedContent[]): ForestStats {
  const byType: Record<string, number> = {};
  const byStage: Record<string, number> = {};
  
  for (const seed of seeds) {
    byType[seed.meta.type] = (byType[seed.meta.type] || 0) + 1;
    byStage[seed.meta.stage] = (byStage[seed.meta.stage] || 0) + 1;
  }
  
  return {
    totalSeeds: seeds.length,
    byType,
    byStage,
    lastUpdated: new Date(),
  };
}

export function getGrowthDistribution(seeds: SeedContent[]): Record<string, number> {
  const distribution: Record<string, number> = {
    sprout: 0,
    sapling: 0,
    mature: 0,
    ancient: 0,
  };
  
  for (const seed of seeds) {
    if (seed.meta.stage in distribution) {
      distribution[seed.meta.stage]++;
    }
  }
  
  return distribution;
}

export function getTypeDistribution(seeds: SeedContent[]): Record<string, number> {
  const distribution: Record<string, number> = {
    project: 0,
    experiment: 0,
    note: 0,
    writing: 0,
  };
  
  for (const seed of seeds) {
    if (seed.meta.type in distribution) {
      distribution[seed.meta.type]++;
    }
  }
  
  return distribution;
}

export function getMostRecentSeeds(seeds: SeedContent[], limit: number = 5): SeedContent[] {
  return [...seeds]
    .sort((a, b) => {
      const dateA = new Date(a.meta.tended || a.meta.planted || 0);
      const dateB = new Date(b.meta.tended || b.meta.planted || 0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, limit);
}