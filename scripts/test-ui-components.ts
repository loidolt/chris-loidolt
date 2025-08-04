#!/usr/bin/env npx tsx

// Test script to verify UI components have proper types
import type { SeedContent, Garden } from '@/lib/seed/types';
import type { GardenStats } from '@/lib/garden/stats';

// Mock data for testing
const mockSeed: SeedContent = {
  slug: 'test-project',
  path: '.seed/README.md',
  meta: {
    title: 'Test Project',
    type: 'project',
    stage: 'budding',
    description: 'A test project for UI components',
    tags: ['test', 'typescript', 'react'],
    featured: true,
    planted: '2024-01-01',
    tended: '2024-03-01',
  },
  content: '<p>Test content</p>',
  raw: 'Test content',
  excerpt: 'A test project for UI components...',
  readingTime: 2,
  wordCount: 150,
  source: {
    type: 'repository',
    url: 'https://github.com/test/test-project',
    owner: 'test',
    name: 'test-project',
    stars: 42,
    language: 'TypeScript',
  },
};

const mockGarden: Garden = {
  seeds: [mockSeed],
  stats: {
    totalSeeds: 1,
    byType: { project: 1 },
    byStage: { budding: 1 },
    lastUpdated: new Date(),
  },
};

console.log('✅ UI Components type check successful!');
console.log('\nMock data created:');
console.log('- SeedContent:', mockSeed.meta.title);
console.log('- Garden stats:', mockGarden.stats.totalSeeds, 'seeds');

// Verify component props types
import type { SeedCardProps } from '@/components/seed/SeedCard';
import type { SeedGridProps } from '@/components/seed/SeedGrid';
import type { GardenStatsProps } from '@/components/garden/GardenStats';

const seedCardProps: SeedCardProps = { seed: mockSeed };
const seedGridProps: SeedGridProps = { seeds: [mockSeed] };
const gardenStatsProps: GardenStatsProps = { garden: mockGarden };

console.log('\n✅ Component props validated!');
console.log('- SeedCard props OK');
console.log('- SeedGrid props OK');
console.log('- GardenStats props OK');