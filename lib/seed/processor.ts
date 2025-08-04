import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import readingTime from 'reading-time';
import yaml from 'js-yaml';
import type { GitHubClient } from '@/lib/github/client';
import type { Repository } from '@/types';
import type { SeedMeta, SeedContent } from './types';

export class SeedProcessor {
  private client: any; // Accept both GitHubClient and CachedGitHubClient
  
  constructor(client: any) {
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
    
    throw new Error(`No meta file found in ${repoName}/.seed/`);
  }
  
  private validateMeta(meta: unknown, repoName: string): asserts meta is SeedMeta {
    const required = ['title', 'type', 'stage'];
    const metaObj = meta as Record<string, unknown>;
    const missing = required.filter(field => !metaObj[field]);
    
    if (missing.length > 0) {
      throw new Error(
        `Missing required fields in ${repoName}/.seed/meta.yml: ${missing.join(', ')}`
      );
    }
    
    // Validate type
    const validTypes = ['project', 'experiment', 'note', 'writing'];
    if (!validTypes.includes(metaObj.type as string)) {
      throw new Error(
        `Invalid type '${metaObj.type}' in ${repoName}. Must be one of: ${validTypes.join(', ')}`
      );
    }
    
    // Validate stage
    const validStages = ['sprout', 'sapling', 'mature', 'ancient'];
    if (!validStages.includes(metaObj.stage as string)) {
      throw new Error(
        `Invalid stage '${metaObj.stage}' in ${repoName}. Must be one of: ${validStages.join(', ')}`
      );
    }
  }
  
  private async fetchContent(repoName: string): Promise<{ content: string; path: string }> {
    // Priority order for content files
    const paths = [
      '.seed/README.md',
      '.seed/content.md',
      '.seed/index.md',
      'README.md',  // Fallback to root README
    ];
    
    for (const path of paths) {
      const content = await this.client.fetchRepoContent(repoName, path);
      if (content) {
        return { content, path };
      }
    }
    
    throw new Error(`No content file found for ${repoName}`);
  }
  
  private async processMarkdown(content: string): Promise<string> {
    // Extract frontmatter if present
    const { content: markdownContent } = matter(content);
    
    // Process with remark
    const processed = await remark()
      .use(remarkGfm)  // GitHub Flavored Markdown
      .use(html)
      .process(markdownContent);
    
    return processed.toString();
  }
  
  private extractExcerpt(content: string, description?: string): string {
    // Use provided description if available
    if (description) return description;
    
    // Extract from content
    const { content: markdownContent } = matter(content);
    
    // Find first paragraph that's not a heading or code block
    const lines = markdownContent.split('\n');
    const paragraphs: string[] = [];
    let inCodeBlock = false;
    
    for (const line of lines) {
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      
      if (inCodeBlock) continue;
      if (line.startsWith('#')) continue;
      if (line.trim() === '') continue;
      if (line.startsWith('-') || line.startsWith('*')) continue;
      
      paragraphs.push(line);
      if (paragraphs.length >= 2) break;
    }
    
    const excerpt = paragraphs.join(' ').substring(0, 200);
    return excerpt.length === 200 ? excerpt + '...' : excerpt;
  }
}