# Digital Garden Implementation Guide

A comprehensive guide to implementing a GitHub-based digital garden using the seed metaphor system with Next.js 15+ and the GitHub API.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Concepts](#core-concepts)
3. [Implementation Phases](#implementation-phases)
4. [Phase 1: Project Setup](#phase-1-project-setup)
5. [Phase 2: GitHub Integration](#phase-2-github-integration)
6. [Phase 3: Seed Discovery](#phase-3-seed-discovery)
7. [Phase 4: Seed Processing](#phase-4-seed-processing)
8. [Phase 5: Garden Management](#phase-5-garden-management)
9. [Phase 6: UI Components](#phase-6-ui-components)
10. [Phase 7: Routes & Pages](#phase-7-routes--pages)
11. [Phase 8: Garden Features](#phase-8-garden-features)
12. [Phase 9: Performance & Caching](#phase-9-performance--caching)
13. [Testing Strategy](#testing-strategy)
14. [Deployment](#deployment)

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   GitHub API    │────▶│  Seed Discovery │────▶│ Seed Processing │
│   (Source)      │     │     Engine      │     │    Pipeline     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │                         │
                                ▼                         ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │ Digital Garden  │     │  Static Build   │
                        │   Management    │     │   (Next.js)     │
                        └─────────────────┘     └─────────────────┘
```

### Core Technologies

- **Next.js 15+** - App Router, RSC, Static Generation
- **TypeScript** - Type safety throughout
- **Octokit** - GitHub API client
- **MDX** - Enhanced markdown processing
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library

### Key Design Decisions

1. **Seed Metaphor** - Content items are "seeds" that grow through stages
2. **Build-time Discovery** - Fetch all seeds at build time for performance
3. **GitHub as CMS** - All content stored in GitHub repositories
4. **No Database** - All data from GitHub API + static files
5. **Edge-ready** - Deployable to Vercel, Netlify, Cloudflare Pages

## Core Concepts

### The Garden Metaphor

- **Digital Garden** - The entire website/platform
- **Seeds** - Individual content items from GitHub repositories
- **Planting** - Adding a repository to the garden
- **Growing** - Content evolving through stages
- **Cultivating** - Managing and organizing the garden

### Seed Types

- **project** - Software projects and applications
- **experiment** - Technical experiments and prototypes
- **note** - Quick thoughts and observations
- **writing** - Articles, tutorials, and long-form content

### Growth Stages

- 🌱 **seedling** - New ideas, early drafts
- 🌿 **budding** - Active development, growing
- 🌳 **evergreen** - Mature, actively maintained
- 🌲 **perennial** - Complete but worth preserving

## Implementation Phases

### Phase Overview

1. **Setup** (2 hours) - Initialize Next.js project with TypeScript
2. **GitHub Integration** (4 hours) - Connect to GitHub API
3. **Seed Discovery** (6 hours) - Build discovery engine
4. **Seed Processing** (6 hours) - Process markdown, metadata
5. **Garden Management** (4 hours) - Create garden system
6. **UI Components** (8 hours) - Build seed/garden components
7. **Routes & Pages** (4 hours) - Implement page structure
8. **Garden Features** (6 hours) - Add search, stats, connections
9. **Performance** (4 hours) - Optimize caching and builds

Total estimated time: 44 hours

## Phase 1: Project Setup

### 1.1 Initialize Project

```bash
# Create Next.js project with TypeScript
npx create-next-app@latest digital-garden --typescript --app --tailwind
cd digital-garden

# Install core dependencies
npm install @octokit/rest gray-matter reading-time js-yaml
npm install @radix-ui/react-tooltip @radix-ui/react-dialog
npm install fuse.js
npm install --save-dev @types/js-yaml

# Install shadcn/ui CLI
npx shadcn@latest init
```

### 1.2 Project Structure

```bash
# Create directory structure
mkdir -p lib/{github,seed,garden,cache,utils}
mkdir -p app/{garden,seeds,api}
mkdir -p components/{ui,seed,garden,layout}
mkdir -p config
mkdir -p types
```

### 1.3 Environment Configuration

```env
# .env.local
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_OWNER=yourusername
SITE_URL=https://yourdomain.com
REVALIDATE_SECRET=your-secret-key
```

### 1.4 TypeScript Configuration

```typescript
// types/index.ts
export interface Repository {
  name: string;
  full_name: string;
  description: string | null;
  topics: string[];
  html_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  language: string | null;
  default_branch: string;
}

export interface Gist {
  id: string;
  description: string | null;
  public: boolean;
  files: Record<string, GistFile>;
  html_url: string;
  created_at: string;
  updated_at: string;
  comments: number;
}

export interface GistFile {
  filename: string;
  type: string;
  language: string | null;
  raw_url: string;
  size: number;
  content?: string;
}

export interface ProcessedContent {
  html: string;
  mdx?: string;
}

export interface SeedSource {
  type: 'repository' | 'gist';
  url: string;
  owner: string;
  name: string;
  stars?: number;
  language?: string;
  data: Repository | Gist;
}

export interface SeedMeta {
  // Required fields
  title: string;
  type: ContentType;
  stage: GrowthStage;
  
  // Recommended fields
  description?: string;
  tags?: string[];
  
  // Optional fields
  featured?: boolean;
  draft?: boolean;
  planted?: string;  // ISO date
  tended?: string;   // ISO date
  
  // Connections to other seeds
  connections?: string[];
  
  // Type-specific fields
  status?: 'active' | 'maintenance' | 'complete' | 'abandoned';
  technologies?: string[];
  demoUrl?: string;
  
  // Allow custom fields
  [key: string]: any;
}

export interface Seed {
  slug: string;
  meta: SeedMeta;
  content: ProcessedContent;
  source: SeedSource;
}

export type ContentType = 'project' | 'note' | 'writing' | 'experiment';
export type GrowthStage = 'seedling' | 'budding' | 'evergreen' | 'perennial';
```

## Phase 2: GitHub Integration

### 2.1 GitHub Client

```typescript
// lib/github/client.ts
import { Octokit } from '@octokit/rest';
import type { Repository, Gist } from '@/types';

export class GitHubClient {
  private octokit: Octokit;
  private owner: string;

  constructor(token: string, owner: string) {
    this.octokit = new Octokit({ auth: token });
    this.owner = owner;
  }

  async fetchUserRepos(): Promise<Repository[]> {
    const repos = await this.octokit.paginate(
      this.octokit.repos.listForUser,
      {
        username: this.owner,
        per_page: 100,
        type: 'owner',
      }
    );
    
    return repos as Repository[];
  }

  async fetchOrgRepos(org: string): Promise<Repository[]> {
    const repos = await this.octokit.paginate(
      this.octokit.repos.listForOrg,
      {
        org,
        per_page: 100,
      }
    );
    
    return repos as Repository[];
  }

  async fetchRepoContent(repo: string, path: string): Promise<string> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo,
        path,
      });

      if ('content' in data && data.type === 'file') {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
      
      throw new Error('Not a file');
    } catch (error) {
      return '';
    }
  }

  async fetchRepoTree(repo: string): Promise<any[]> {
    const { data } = await this.octokit.git.getTree({
      owner: this.owner,
      repo,
      tree_sha: 'HEAD',
      recursive: 'true',
    });
    
    return data.tree;
  }

  async fetchUserGists(): Promise<Gist[]> {
    const gists = await this.octokit.paginate(
      this.octokit.gists.listForUser,
      {
        username: this.owner,
        per_page: 100,
      }
    );
    
    return gists as Gist[];
  }

  async fetchGist(gistId: string): Promise<Gist> {
    const { data } = await this.octokit.gists.get({
      gist_id: gistId,
    });
    
    return data as Gist;
  }
}
```

### 2.2 Rate Limiting Handler

```typescript
// lib/github/rate-limiter.ts
export class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private requestsPerHour = 5000;
  private requestDelay: number;

  constructor() {
    this.requestDelay = 3600000 / this.requestsPerHour;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.process();
      }
    });
  }

  private async process() {
    this.processing = true;

    while (this.queue.length > 0) {
      const fn = this.queue.shift();
      if (fn) {
        await fn();
        await this.delay(this.requestDelay);
      }
    }

    this.processing = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Phase 3: Seed Discovery

### 3.1 Seed Types

```typescript
// lib/seed/types.ts
export type ContentType = 'project' | 'experiment' | 'note' | 'writing';
export type GrowthStage = 'seedling' | 'budding' | 'evergreen' | 'perennial';

export interface SeedMeta {
  // Required fields
  title: string;
  type: ContentType;
  stage: GrowthStage;
  
  // Recommended fields
  description?: string;
  tags?: string[];
  
  // Optional fields
  featured?: boolean;
  draft?: boolean;
  planted?: string;  // ISO date
  tended?: string;   // ISO date
  
  // Connections to other seeds
  connections?: string[];
  
  // Type-specific fields
  status?: 'active' | 'maintenance' | 'complete' | 'abandoned';
  technologies?: string[];
  demoUrl?: string;
  
  // Allow custom fields
  [key: string]: any;
}

export interface SeedContent {
  // Core identifiers
  slug: string;
  path: string;
  
  // Content
  meta: SeedMeta;
  content: string;  // Processed HTML or MDX code
  raw: string;      // Raw markdown content
  
  // Computed fields
  excerpt: string;
  readingTime: number;  // minutes
  wordCount: number;
  
  // Source info
  source: {
    type: 'repository' | 'gist';
    url: string;
    owner: string;
    name: string;
    stars?: number;
    language?: string;
  };
}

export interface SeedDiscoveryResult {
  seeds: SeedContent[];
  errors: Array<{
    repository: string;
    error: string;
  }>;
  stats: {
    totalRepos: number;
    reposWithSeed: number;
    successfullyProcessed: number;
    failed: number;
    duration: number; // ms
  };
}
```

### 3.2 Seed Discovery Engine

```typescript
// lib/seed/discovery.ts
import { GitHubClient } from '@/lib/github/client';
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

export class SeedDiscoveryEngine {
  private client: GitHubClient;
  private processor: SeedProcessor;
  private config: SeedDiscoveryConfig;
  
  constructor(
    client: GitHubClient, 
    config: Partial<SeedDiscoveryConfig> = {}
  ) {
    this.client = client;
    this.processor = new SeedProcessor(client);
    this.config = { ...defaultConfig, ...config };
  }
  
  async discover(): Promise<SeedDiscoveryResult> {
    const startTime = Date.now();
    const errors: Array<{ repository: string; error: string }> = [];
    
    // Fetch all repositories
    const repos = await this.fetchRepositories();
    
    // Filter repositories
    const filteredRepos = this.filterRepositories(repos);
    
    // Check for .seed directories
    const reposWithSeed = await this.checkForSeeds(filteredRepos);
    
    // Process seeds
    const seeds: SeedContent[] = [];
    
    if (this.config.parallel) {
      // Process in batches
      for (let i = 0; i < reposWithSeed.length; i += this.config.maxConcurrent) {
        const batch = reposWithSeed.slice(i, i + this.config.maxConcurrent);
        const results = await Promise.allSettled(
          batch.map(repo => this.processor.process(repo))
        );
        
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            seeds.push(result.value);
          } else {
            errors.push({
              repository: batch[index].name,
              error: result.reason.message,
            });
          }
        });
      }
    } else {
      // Process sequentially
      for (const repo of reposWithSeed) {
        try {
          const seed = await this.processor.process(repo);
          seeds.push(seed);
        } catch (error) {
          errors.push({
            repository: repo.name,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }
    
    return {
      seeds,
      errors,
      stats: {
        totalRepos: repos.length,
        reposWithSeed: reposWithSeed.length,
        successfullyProcessed: seeds.length,
        failed: errors.length,
        duration: Date.now() - startTime,
      },
    };
  }
  
  private async fetchRepositories(): Promise<Repository[]> {
    const repos = await this.client.fetchUserRepos();
    return repos;
  }
  
  private filterRepositories(repos: Repository[]): Repository[] {
    return repos.filter(repo => {
      // Exclude archived
      if (this.config.excludeArchived && repo.archived) return false;
      
      // Exclude forks
      if (this.config.excludeForks && repo.fork) return false;
      
      // Exclude by name
      if (this.config.excludeRepos.includes(repo.name)) return false;
      
      // Exclude by pattern
      if (this.config.excludePatterns.some(pattern => pattern.test(repo.name))) {
        return false;
      }
      
      // Include private check
      if (!this.config.includePrivate && repo.private) return false;
      
      return true;
    });
  }
  
  private async checkForSeeds(repos: Repository[]): Promise<Repository[]> {
    if (!this.config.checkSeedDirectory) {
      return repos;
    }
    
    const checks = await Promise.all(
      repos.map(async repo => {
        const hasSeed = await this.hasSeedDirectory(repo);
        return { repo, hasSeed };
      })
    );
    
    return checks
      .filter(({ hasSeed }) => hasSeed)
      .map(({ repo }) => repo);
  }
  
  private async hasSeedDirectory(repo: Repository): Promise<boolean> {
    const metaJson = await this.client.fetchRepoContent(repo.name, '.seed/meta.json');
    const metaYaml = await this.client.fetchRepoContent(repo.name, '.seed/meta.yml');
    return !!(metaJson || metaYaml);
  }
}
```

## Phase 4: Seed Processing

### 4.1 Seed Processor

```typescript
// lib/seed/processor.ts
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import readingTime from 'reading-time';
import yaml from 'js-yaml';
import { GitHubClient } from '@/lib/github/client';
import type { Repository } from '@/types';
import type { SeedMeta, SeedContent } from './types';

export class SeedProcessor {
  private client: GitHubClient;
  
  constructor(client: GitHubClient) {
    this.client = client;
  }
  
  async process(repo: Repository): Promise<SeedContent> {
    // Fetch metadata
    const meta = await this.fetchMeta(repo.name);
    
    // Validate required fields
    this.validateMeta(meta, repo.name);
    
    // Fetch content
    const { content, path } = await this.fetchContent(repo.name);
    
    // Process markdown
    const processed = await this.processMarkdown(content);
    
    // Extract excerpt
    const excerpt = this.extractExcerpt(content, meta.description);
    
    // Calculate reading stats
    const stats = readingTime(content);
    
    return {
      slug: repo.name,
      path,
      meta: {
        ...meta,
        // Use repo dates as fallback
        planted: meta.planted || repo.created_at.split('T')[0],
        tended: meta.tended || repo.pushed_at.split('T')[0],
      },
      content: processed,
      raw: content,
      excerpt,
      readingTime: Math.ceil(stats.minutes),
      wordCount: stats.words,
      source: {
        type: 'repository',
        url: repo.html_url,
        owner: repo.owner.login,
        name: repo.name,
        stars: repo.stargazers_count,
        language: repo.language || undefined,
      },
    };
  }
  
  private async fetchMeta(repoName: string): Promise<SeedMeta> {
    // Try YAML first (preferred)
    const yamlContent = await this.client.fetchRepoContent(repoName, '.seed/meta.yml');
    if (yamlContent) {
      try {
        return yaml.load(yamlContent) as SeedMeta;
      } catch (error) {
        throw new Error(`Invalid meta.yml in ${repoName}: ${error}`);
      }
    }
    
    // Fall back to JSON
    const jsonContent = await this.client.fetchRepoContent(repoName, '.seed/meta.json');
    if (jsonContent) {
      try {
        return JSON.parse(jsonContent) as SeedMeta;
      } catch (error) {
        throw new Error(`Invalid meta.json in ${repoName}: ${error}`);
      }
    }
    
    throw new Error(`No metadata found in ${repoName}/.seed/`);
  }
  
  private validateMeta(meta: SeedMeta, repoName: string): void {
    if (!meta.title) {
      throw new Error(`Missing required field 'title' in ${repoName}`);
    }
    
    if (!meta.type || !['project', 'experiment', 'note', 'writing'].includes(meta.type)) {
      throw new Error(`Invalid or missing 'type' in ${repoName}`);
    }
    
    if (!meta.stage || !['seedling', 'budding', 'evergreen', 'perennial'].includes(meta.stage)) {
      throw new Error(`Invalid or missing 'stage' in ${repoName}`);
    }
  }
  
  private async fetchContent(repoName: string): Promise<{ content: string; path: string }> {
    // Priority order for content files
    const contentPaths = [
      '.seed/README.mdx',
      '.seed/README.md',
      '.seed/index.mdx',
      '.seed/index.md',
      '.seed/content.mdx',
      '.seed/content.md',
    ];
    
    for (const path of contentPaths) {
      const content = await this.client.fetchRepoContent(repoName, path);
      if (content) {
        return { content, path };
      }
    }
    
    throw new Error(`No content file found in ${repoName}/.seed/`);
  }
  
  private async processMarkdown(content: string): Promise<string> {
    // Extract frontmatter if present
    const { content: markdown } = matter(content);
    
    // Process with remark
    const processed = await remark()
      .use(remarkGfm)
      .use(html)
      .process(markdown);
    
    return processed.toString();
  }
  
  private extractExcerpt(content: string, description?: string): string {
    if (description) return description;
    
    // Remove frontmatter
    const { content: markdown } = matter(content);
    
    // Find first paragraph
    const paragraphs = markdown
      .split('\n\n')
      .filter(p => p.trim() && !p.startsWith('#') && !p.startsWith('```'));
    
    if (paragraphs.length > 0) {
      return paragraphs[0]
        .slice(0, 200)
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
        .trim() + '...';
    }
    
    return 'No description available.';
  }
}
```

### 4.2 Export Functions

```typescript
// lib/seed/index.ts
import { GitHubClient } from '@/lib/github/client';
import { SeedDiscoveryEngine } from './discovery';
import type { SeedDiscoveryResult } from './types';

export * from './types';
export { SeedProcessor } from './processor';
export { SeedDiscoveryEngine } from './discovery';

export async function discoverSeeds(): Promise<SeedDiscoveryResult> {
  const client = new GitHubClient(
    process.env.GITHUB_TOKEN!,
    process.env.GITHUB_OWNER!
  );
  
  const discovery = new SeedDiscoveryEngine(client);
  return discovery.discover();
}
```

## Phase 5: Garden Management

### 5.1 Garden Statistics

```typescript
// lib/garden/stats.ts
import type { SeedContent } from '@/lib/seed/types';

export interface GardenStats {
  totalSeeds: number;
  byType: Record<string, number>;
  byStage: Record<string, number>;
  lastUpdated: Date;
}

export function calculateGardenStats(seeds: SeedContent[]): GardenStats {
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
    seedling: 0,
    budding: 0,
    evergreen: 0,
    perennial: 0,
  };
  
  for (const seed of seeds) {
    if (seed.meta.stage in distribution) {
      distribution[seed.meta.stage]++;
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
```

### 5.2 Seed Search

```typescript
// lib/garden/search.ts
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
```

### 5.3 Digital Garden Class

```typescript
// lib/garden/index.ts
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
}
```

## Phase 6: UI Components

### 6.1 Seed Components

```typescript
// components/seed/SeedCard.tsx
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SeedContent } from '@/lib/seed/types';

interface SeedCardProps {
  seed: SeedContent;
}

const stageColors = {
  seedling: 'bg-green-100 text-green-800',
  budding: 'bg-yellow-100 text-yellow-800',
  evergreen: 'bg-blue-100 text-blue-800',
  perennial: 'bg-purple-100 text-purple-800',
};

const stageEmojis = {
  seedling: '🌱',
  budding: '🌿',
  evergreen: '🌳',
  perennial: '🌲',
};

export function SeedCard({ seed }: SeedCardProps) {
  return (
    <Link href={`/garden/${seed.slug}`} className="block">
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <Badge className={stageColors[seed.meta.stage]}>
              {stageEmojis[seed.meta.stage]} {seed.meta.stage}
            </Badge>
            {seed.meta.featured && (
              <Badge variant="secondary">⭐ Featured</Badge>
            )}
          </div>
          <CardTitle className="line-clamp-2">{seed.meta.title}</CardTitle>
          <CardDescription className="line-clamp-3">
            {seed.meta.description || seed.excerpt}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            {seed.meta.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {seed.meta.tags && seed.meta.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{seed.meta.tags.length - 3}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{seed.readingTime} min read</span>
            <span>{seed.meta.type}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

```typescript
// components/seed/SeedGrid.tsx
import { SeedCard } from './SeedCard';
import type { SeedContent } from '@/lib/seed/types';

interface SeedGridProps {
  seeds: SeedContent[];
  emptyMessage?: string;
}

export function SeedGrid({ seeds, emptyMessage = 'No seeds found.' }: SeedGridProps) {
  if (seeds.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {seeds.map((seed) => (
        <SeedCard key={seed.slug} seed={seed} />
      ))}
    </div>
  );
}
```

### 6.2 Garden Components

```typescript
// components/garden/GardenStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Garden } from '@/lib/garden';

interface GardenStatsProps {
  garden: Garden;
}

const typeEmojis = {
  project: '🚀',
  experiment: '🧪',
  note: '📝',
  writing: '✍️',
};

const stageEmojis = {
  seedling: '🌱',
  budding: '🌿',
  evergreen: '🌳',
  perennial: '🌲',
};

export function GardenStats({ garden }: GardenStatsProps) {
  const { stats } = garden;
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Seeds</CardTitle>
          <span className="text-2xl">🌱</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSeeds}</div>
          <p className="text-xs text-muted-foreground">
            Across all categories
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">By Type</CardTitle>
          <span className="text-2xl">📊</span>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  {typeEmojis[type as keyof typeof typeEmojis]} {type}
                </span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Growth Stages</CardTitle>
          <span className="text-2xl">🌿</span>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            {Object.entries(stats.byStage).map(([stage, count]) => (
              <div key={stage} className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  {stageEmojis[stage as keyof typeof stageEmojis]} {stage}
                </span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
          <span className="text-2xl">🕐</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Date(stats.lastUpdated).toLocaleDateString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(stats.lastUpdated).toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Phase 7: Routes & Pages

### 7.1 Garden Pages

```typescript
// app/garden/page.tsx
import { DigitalGarden } from '@/lib/garden';
import { GardenHeader, GardenStats, GardenLayout } from '@/components/garden';
import { SeedGrid } from '@/components/seed';

export default async function GardenPage() {
  const garden = new DigitalGarden();
  const gardenData = await garden.cultivate();
  
  return (
    <GardenLayout>
      <GardenHeader 
        title="Digital Garden 🌱"
        description={`A collection of ${gardenData.stats.totalSeeds} ideas, projects, and thoughts growing in public`}
      />
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Garden Overview</h2>
        <GardenStats garden={gardenData} />
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-6">All Seeds</h2>
        <SeedGrid seeds={gardenData.seeds} />
      </section>
    </GardenLayout>
  );
}
```

```typescript
// app/garden/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { DigitalGarden } from '@/lib/garden';
import { GardenLayout } from '@/components/garden';
import { SeedDetail } from '@/components/seed';

interface SeedPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SeedPage({ params }: SeedPageProps) {
  const { slug } = await params;
  const garden = new DigitalGarden();
  const { seeds } = await garden.cultivate();
  
  const seed = seeds.find(s => s.slug === slug);
  
  if (!seed) {
    notFound();
  }
  
  return (
    <GardenLayout>
      <SeedDetail seed={seed} />
    </GardenLayout>
  );
}

export async function generateStaticParams() {
  const garden = new DigitalGarden();
  const { seeds } = await garden.cultivate();
  
  return seeds.map((seed) => ({
    slug: seed.slug,
  }));
}
```

### 7.2 Category Pages

```typescript
// app/seeds/projects/page.tsx
import { DigitalGarden } from '@/lib/garden';
import { GardenHeader, GardenLayout } from '@/components/garden';
import { SeedGrid } from '@/components/seed';

export default async function ProjectsPage() {
  const garden = new DigitalGarden();
  await garden.cultivate();
  
  const projectSeeds = garden.findByType('project' as const);
  
  return (
    <GardenLayout>
      <GardenHeader 
        title="Projects 🚀"
        description="Software projects and experiments I've built"
      />
      
      <SeedGrid 
        seeds={projectSeeds} 
        emptyMessage="No projects found. Time to build something!"
      />
    </GardenLayout>
  );
}
```

### 7.3 API Routes

```typescript
// app/api/seeds/route.ts
import { NextResponse } from 'next/server';
import { DigitalGarden } from '@/lib/garden';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const stage = searchParams.get('stage');
    const featured = searchParams.get('featured');
    
    const garden = new DigitalGarden();
    const { seeds } = await garden.cultivate();
    
    let filteredSeeds = seeds;
    
    if (type) {
      filteredSeeds = filteredSeeds.filter(seed => seed.meta.type === type);
    }
    
    if (stage) {
      filteredSeeds = filteredSeeds.filter(seed => seed.meta.stage === stage);
    }
    
    if (featured === 'true') {
      filteredSeeds = filteredSeeds.filter(seed => seed.meta.featured === true);
    }
    
    return NextResponse.json({
      seeds: filteredSeeds,
      count: filteredSeeds.length,
    });
  } catch (error) {
    console.error('Error fetching seeds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seeds' },
      { status: 500 }
    );
  }
}
```

## Phase 8: Garden Features

### 8.1 Search Component

```typescript
// components/garden/SeedSearch.tsx
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { SeedGrid } from '@/components/seed';
import type { SeedContent } from '@/lib/seed/types';

interface SeedSearchProps {
  seeds: SeedContent[];
}

export function SeedSearch({ seeds }: SeedSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SeedContent[]>([]);

  useEffect(() => {
    if (query.length > 2) {
      const filtered = seeds.filter(seed => {
        const searchQuery = query.toLowerCase();
        return (
          seed.meta.title.toLowerCase().includes(searchQuery) ||
          seed.meta.description?.toLowerCase().includes(searchQuery) ||
          seed.meta.tags?.some(tag => tag.toLowerCase().includes(searchQuery))
        );
      });
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query, seeds]);

  return (
    <div className="space-y-6">
      <Input
        type="search"
        placeholder="Search seeds by title, description, or tags..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full"
      />
      
      {query.length > 2 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Found {results.length} {results.length === 1 ? 'seed' : 'seeds'}
          </h3>
          <SeedGrid seeds={results} />
        </div>
      )}
    </div>
  );
}
```

### 8.2 Related Seeds

```typescript
// components/seed/RelatedSeeds.tsx
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { SeedContent } from '@/lib/seed/types';

interface RelatedSeedsProps {
  currentSeed: SeedContent;
  relatedSeeds: SeedContent[];
}

export function RelatedSeeds({ currentSeed, relatedSeeds }: RelatedSeedsProps) {
  if (relatedSeeds.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t">
      <h2 className="text-2xl font-semibold mb-6">Related Seeds</h2>
      <div className="grid gap-4">
        {relatedSeeds.map(seed => (
          <Link
            key={seed.slug}
            href={`/garden/${seed.slug}`}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{seed.meta.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {seed.excerpt}
                </p>
              </div>
              <Badge variant="outline">{seed.meta.type}</Badge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

## Phase 9: Performance & Caching

### 9.1 Cache Manager

```typescript
// lib/cache/manager.ts
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export class CacheManager {
  private cacheDir: string;
  private ttl: number;

  constructor(ttl = 3600000) { // 1 hour default
    this.cacheDir = path.join(process.cwd(), '.cache');
    this.ttl = ttl;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const hash = this.hash(key);
      const filePath = path.join(this.cacheDir, `${hash}.json`);
      
      const stats = await fs.stat(filePath);
      const age = Date.now() - stats.mtimeMs;
      
      if (age > this.ttl) {
        await fs.unlink(filePath);
        return null;
      }
      
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    await fs.mkdir(this.cacheDir, { recursive: true });
    
    const hash = this.hash(key);
    const filePath = path.join(this.cacheDir, `${hash}.json`);
    
    await fs.writeFile(filePath, JSON.stringify(value, null, 2));
  }

  private hash(key: string): string {
    return crypto.createHash('md5').update(key).digest('hex');
  }
}
```

### 9.2 Incremental Static Regeneration

```typescript
// app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');
  
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }
  
  try {
    const { path } = await request.json();
    
    if (path) {
      revalidatePath(path);
    } else {
      // Revalidate all main paths
      revalidatePath('/');
      revalidatePath('/garden');
      revalidatePath('/seeds/projects');
      revalidatePath('/seeds/notes');
      revalidatePath('/seeds/writing');
    }
    
    return NextResponse.json({ revalidated: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error revalidating' }, { status: 500 });
  }
}
```

## Testing Strategy

### Unit Tests

```typescript
// __tests__/seed-discovery.test.ts
import { SeedDiscoveryEngine } from '@/lib/seed/discovery';
import { GitHubClient } from '@/lib/github/client';

describe('SeedDiscoveryEngine', () => {
  const mockClient = new GitHubClient('mock-token', 'mock-owner');
  
  it('discovers repositories with .seed directories', async () => {
    const engine = new SeedDiscoveryEngine(mockClient);
    const result = await engine.discover();
    
    expect(result.seeds).toBeDefined();
    expect(result.stats.totalRepos).toBeGreaterThan(0);
  });
  
  it('filters out excluded repositories', async () => {
    const engine = new SeedDiscoveryEngine(mockClient, {
      excludeRepos: ['dotfiles', '.github'],
    });
    
    const result = await engine.discover();
    const repoNames = result.seeds.map(s => s.slug);
    
    expect(repoNames).not.toContain('dotfiles');
    expect(repoNames).not.toContain('.github');
  });
});
```

### Integration Tests

```typescript
// __tests__/garden.test.ts
import { DigitalGarden } from '@/lib/garden';

describe('DigitalGarden', () => {
  it('cultivates seeds from GitHub', async () => {
    const garden = new DigitalGarden();
    const result = await garden.cultivate();
    
    expect(result.seeds).toBeDefined();
    expect(result.stats).toBeDefined();
    expect(result.stats.totalSeeds).toEqual(result.seeds.length);
  });
  
  it('finds seeds by type', async () => {
    const garden = new DigitalGarden();
    await garden.cultivate();
    
    const projects = garden.findByType('project');
    expect(projects.every(s => s.meta.type === 'project')).toBe(true);
  });
});
```

## Deployment

### Build Configuration

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "GITHUB_TOKEN": "@github-token",
    "GITHUB_OWNER": "@github-owner"
  },
  "crons": [
    {
      "path": "/api/revalidate",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy Digital Garden

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * *' # Daily
  repository_dispatch:
    types: [seed-update]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_OWNER: ${{ github.repository_owner }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Seed Setup Guide

### Repository Structure

```bash
your-repo/
├── .seed/
│   ├── meta.yml      # Metadata configuration
│   ├── README.md     # Main content (or .mdx)
│   └── assets/       # Images and files
└── ... (your project files)
```

### Example meta.yml

```yaml
# Required fields
title: Your Project Name
type: project      # project, experiment, note, or writing
stage: budding     # seedling, budding, evergreen, or perennial

# Recommended fields
description: Brief description of your project
tags: [react, typescript, nextjs]

# Optional fields
featured: true
draft: false
planted: 2024-01-15
tended: 2024-03-20

# Connections to other seeds
connections: [authentication-guide, react-patterns]

# Type-specific fields (for projects)
status: active     # active, maintenance, complete, or abandoned
technologies: [React, TypeScript, PostgreSQL]
demoUrl: https://demo.example.com
```

## Next Steps

1. **Add MDX support** for interactive content
2. **Implement webhooks** for real-time updates
3. **Build RSS feeds** for content syndication
4. **Add analytics** integration
5. **Create admin dashboard** for content management
6. **Build CLI tool** for local seed development
7. **Add commenting system** using GitHub discussions
8. **Implement full-text search** with Algolia or MeiliSearch

This implementation guide provides a complete foundation for building a GitHub-based digital garden using the seed metaphor system, with automatic discovery, processing, and presentation of content from your GitHub repositories.