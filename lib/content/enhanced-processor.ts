import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import readingTime from 'reading-time';
import { GitHubClient } from '@/lib/github/client';
import { processMDX } from './mdx';
import type { Repository, Content, ContentType, GrowthStage } from '@/types';

export interface ProcessingOptions {
  enableMDX?: boolean;
  fetchAssets?: boolean;
  extractImages?: boolean;
}

export class EnhancedContentProcessor {
  private client: GitHubClient;
  private options: ProcessingOptions;

  constructor(client: GitHubClient, options: ProcessingOptions = {}) {
    this.client = client;
    this.options = {
      enableMDX: true,
      fetchAssets: true,
      extractImages: true,
      ...options
    };
  }

  async processRepository(repo: Repository): Promise<Content | null> {
    try {
      // Fetch README or index file
      const mainContent = await this.fetchMainContent(repo.name);
      if (!mainContent) return null;

      // Fetch metadata from multiple sources
      const metadata = await this.fetchEnhancedMetadata(repo.name);

      // Process content based on file type
      const processed = await this.processContent(
        mainContent.content, 
        mainContent.path, 
        metadata, 
        repo
      );
      
      return processed;
    } catch (error) {
      console.error(`Error processing ${repo.name}:`, error);
      return null;
    }
  }

  private async fetchMainContent(repo: string): Promise<{ content: string; path: string } | null> {
    // Priority order for main content files
    const possiblePaths = [
      'README.mdx',
      'index.mdx',
      'README.md',
      'readme.md',
      'index.md',
      'README.MD'
    ];
    
    for (const path of possiblePaths) {
      const content = await this.client.fetchRepoContent(repo, path);
      if (content) return { content, path };
    }
    
    return null;
  }

  private async fetchEnhancedMetadata(repo: string): Promise<Record<string, unknown>> {
    const metadata: Record<string, unknown> = {};
    
    // Try to fetch various metadata sources
    const sources = [
      { path: 'metadata.json', parser: JSON.parse },
      { path: 'garden.json', parser: JSON.parse },
      { path: '.garden/config.json', parser: JSON.parse },
      { path: 'package.json', parser: (content: string) => {
        const pkg = JSON.parse(content);
        return {
          dependencies: pkg.dependencies,
          keywords: pkg.keywords,
          author: pkg.author,
          license: pkg.license
        };
      }}
    ];
    
    for (const source of sources) {
      const content = await this.client.fetchRepoContent(repo, source.path);
      if (content) {
        try {
          const parsed = source.parser(content);
          Object.assign(metadata, parsed);
        } catch (error) {
          console.warn(`Failed to parse ${source.path} in ${repo}:`, error);
        }
      }
    }
    
    return metadata;
  }

  private async processContent(
    content: string,
    path: string,
    metadata: Record<string, unknown>,
    repo: Repository
  ): Promise<Content> {
    // Parse frontmatter
    const { data: frontmatter, content: markdownContent } = matter(content);
    
    // Determine if this is an MDX file
    const isMDX = path.endsWith('.mdx');
    
    let processedContent: string;
    let mdxCode: string | undefined;
    
    if (isMDX && this.options.enableMDX) {
      // Process as MDX
      const { code, frontmatter: mdxFrontmatter } = await processMDX(markdownContent);
      processedContent = ''; // MDX will be rendered client-side
      mdxCode = code;
      Object.assign(frontmatter, mdxFrontmatter);
    } else {
      // Process as regular markdown
      const processed = await remark()
        .use(remarkGfm)
        .use(html)
        .process(markdownContent);
      processedContent = processed.toString();
    }
    
    // Extract structured data
    this.extractTitle(markdownContent, frontmatter.title || repo.name);
    this.extractDescription(
      markdownContent, 
      frontmatter.description || repo.description || ''
    );
    
    // Determine content attributes
    this.determineType(repo.topics, frontmatter);
    this.determineStage(repo.topics, metadata, frontmatter);
    
    // Extract connections and references
    this.extractConnections(markdownContent);
    const references = this.extractReferences(markdownContent);
    
    // Extract images if enabled
    const images = this.options.extractImages 
      ? this.extractImages(markdownContent) 
      : [];
    
    // Calculate reading time
    const stats = readingTime(markdownContent);
    
    // Merge all metadata sources
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const finalMetadata = {
      ...metadata,
      ...frontmatter,
      readingTime: stats.text,
      readingTimeMinutes: stats.minutes,
      wordCount: stats.words,
      language: repo.language,
      stars: repo.stargazers_count,
      isMDX,
      mdxCode,
      images,
      references,
      lastModified: repo.pushed_at,
      repoUrl: repo.html_url,
    };
    
    return {
      html: processedContent,
      mdx: mdxCode,
    };
  }

  private extractTitle(content: string, fallback: string): string {
    // Try to extract from first heading
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) return h1Match[1];
    
    // Try to extract from first line if it's not empty
    const firstLine = content.trim().split('\n')[0];
    if (firstLine && !firstLine.startsWith('#')) {
      return firstLine.slice(0, 100);
    }
    
    return fallback;
  }

  private extractDescription(content: string, fallback: string): string {
    // Try to extract first paragraph after title
    const paragraphs = content
      .split('\n\n')
      .filter(p => p.trim() && !p.startsWith('#') && !p.startsWith('```'));
    
    if (paragraphs.length > 0) {
      return paragraphs[0].slice(0, 200).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    }
    
    return fallback;
  }

  private determineType(topics: string[], frontmatter: Record<string, unknown>): ContentType {
    // Check frontmatter first
    if (frontmatter.type && ['project', 'note', 'writing', 'experiment'].includes(frontmatter.type as string)) {
      return frontmatter.type as ContentType;
    }
    
    // Then check topics
    const types: ContentType[] = ['project', 'note', 'writing', 'experiment'];
    for (const type of types) {
      if (topics.includes(type)) return type;
    }
    
    // Infer from content patterns
    if (topics.some(t => ['tutorial', 'guide', 'how-to'].includes(t))) return 'writing';
    if (topics.some(t => ['prototype', 'poc', 'demo'].includes(t))) return 'experiment';
    if (topics.some(t => ['app', 'library', 'tool'].includes(t))) return 'project';
    
    return 'note';
  }

  private determineStage(topics: string[], metadata: Record<string, unknown>, frontmatter: Record<string, unknown>): GrowthStage {
    // Check frontmatter first
    if (frontmatter.stage && ['seedling', 'budding', 'evergreen'].includes(frontmatter.stage as string)) {
      return frontmatter.stage as GrowthStage;
    }
    
    // Then check metadata
    if (metadata.stage) return metadata.stage as GrowthStage;
    
    // Then check topics
    const stages: GrowthStage[] = ['seedling', 'budding', 'evergreen'];
    for (const stage of stages) {
      if (topics.includes(stage)) return stage;
    }
    
    // Infer from other signals
    if (frontmatter.draft === true || topics.includes('wip')) return 'seedling';
    if (topics.includes('complete') || topics.includes('stable')) return 'evergreen';
    
    return 'budding';
  }

  private extractConnections(content: string): string[] {
    const connections = new Set<string>();
    
    // Wiki-style links [[connection]]
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    let match;
    while ((match = wikiLinkRegex.exec(content)) !== null) {
      connections.add(match[1].trim());
    }
    
    // Obsidian-style links with aliases [[connection|alias]]
    const obsidianLinkRegex = /\[\[([^|\]]+)\|([^\]]+)\]\]/g;
    while ((match = obsidianLinkRegex.exec(content)) !== null) {
      connections.add(match[1].trim());
    }
    
    return Array.from(connections);
  }

  private extractExcerpt(content: string): string {
    // Remove frontmatter
    const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---/, '').trim();
    
    // Get first paragraph or first 160 characters
    const firstParagraph = contentWithoutFrontmatter.split('\n\n')[0];
    const excerpt = firstParagraph.length > 160 
      ? firstParagraph.substring(0, 157) + '...' 
      : firstParagraph;
    
    // Remove markdown syntax
    return excerpt
      .replace(/[#*`\[\]]/g, '')
      .replace(/\!\[.*?\]\(.*?\)/g, '')
      .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
      .trim();
  }

  private extractReferences(content: string): string[] {
    const references = new Set<string>();
    
    // Standard markdown links
    const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = mdLinkRegex.exec(content)) !== null) {
      const url = match[2];
      if (url.startsWith('http')) {
        references.add(url);
      }
    }
    
    // Reference-style links
    const refLinkRegex = /\[([^\]]+)\]:\s*(.+)$/gm;
    while ((match = refLinkRegex.exec(content)) !== null) {
      const url = match[2].trim();
      if (url.startsWith('http')) {
        references.add(url);
      }
    }
    
    return Array.from(references);
  }

  private extractImages(content: string): string[] {
    const images = new Set<string>();
    
    // Markdown images
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    while ((match = imgRegex.exec(content)) !== null) {
      images.add(match[2]);
    }
    
    // HTML images
    const htmlImgRegex = /<img[^>]+src=["']([^"']+)["']/g;
    while ((match = htmlImgRegex.exec(content)) !== null) {
      images.add(match[1]);
    }
    
    return Array.from(images);
  }
}