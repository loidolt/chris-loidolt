// Seed system types - clean and simple

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
  [key: string]: unknown;
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