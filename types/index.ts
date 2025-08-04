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
  private: boolean;
  archived: boolean;
  fork: boolean;
  owner: {
    login: string;
    [key: string]: any;
  };
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

// Gist-specific metadata
export interface GistMeta extends Omit<SeedMeta, 'type' | 'stage'> {
  type: ContentType;
  stage: GrowthStage;
}

// Re-export the consistent SeedContent type from lib/seed/types
export type { SeedContent as Seed } from '@/lib/seed/types';

export type ContentType = 'project' | 'note' | 'writing' | 'experiment';
export type GrowthStage = 'seedling' | 'budding' | 'evergreen' | 'perennial';

// Alias for content processing
export interface Content {
  html: string;
  mdx?: string;
}