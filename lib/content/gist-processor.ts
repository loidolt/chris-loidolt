import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import readingTime from 'reading-time';
import { GitHubClient } from '@/lib/github/client';
import { processMDX } from './mdx';
import type { Gist, Content, ContentType, GrowthStage } from '@/types';

export interface GistMeta {
  type: ContentType;
  stage?: GrowthStage;
  tags?: string[];
  connections?: string[];
  planted?: string;
  tended?: string;
  featured?: boolean;
  draft?: boolean;
  [key: string]: unknown;
}

export class GistContentProcessor {
  private client: GitHubClient;

  constructor(client: GitHubClient) {
    this.client = client;
  }

  async processGist(gist: Gist): Promise<Content | null> {
    try {
      // Find the main content file
      const contentFile = this.findMainContentFile(gist);
      if (!contentFile) return null;

      // Check if this is a garden gist (has garden.md or description with #garden)
      if (!this.isGardenGist(gist)) return null;

      // Fetch content
      const content = await this.client.fetchGistContent(gist.id, contentFile.filename);
      if (!content) return null;

      // Process the content
      return await this.processContent(content, contentFile.filename, gist);
    } catch (error) {
      console.error(`Error processing gist ${gist.id}:`, error);
      return null;
    }
  }

  private isGardenGist(gist: Gist): boolean {
    // Check if description contains #garden tag
    if (gist.description && gist.description.includes('#garden')) {
      return true;
    }

    // Check if there's a garden.md metadata file
    if ('garden.md' in gist.files || 'garden.json' in gist.files) {
      return true;
    }

    // Check if main content file has garden frontmatter
    const contentFile = this.findMainContentFile(gist);
    if (contentFile && contentFile.filename.match(/\.(md|mdx)$/)) {
      return true; // We'll check frontmatter during processing
    }

    return false;
  }

  private findMainContentFile(gist: Gist): { filename: string } | null {
    const filenames = Object.keys(gist.files);
    
    // Priority order for content files
    const priorityPatterns = [
      /^index\.(md|mdx)$/,
      /^readme\.(md|mdx)$/i,
      /^content\.(md|mdx)$/,
      /^note\.(md|mdx)$/,
      /^post\.(md|mdx)$/,
      /\.(md|mdx)$/ // Any markdown file
    ];

    for (const pattern of priorityPatterns) {
      const match = filenames.find(name => pattern.test(name));
      if (match) return gist.files[match];
    }

    return null;
  }

  private async processContent(
    content: string,
    filename: string,
    gist: Gist
  ): Promise<Content | null> {
    // Parse frontmatter
    const { data: frontmatter, content: markdownContent } = matter(content);

    // Check if it's a garden content via frontmatter
    if (!this.hasGardenMetadata(frontmatter, gist)) {
      return null;
    }

    // Parse gist description for metadata
    const descriptionMeta = this.parseDescriptionMetadata(gist.description || '');

    // Merge metadata sources
    const metadata: GistMeta = {
      type: descriptionMeta.type || frontmatter.type || 'note',
      stage: descriptionMeta.stage || frontmatter.stage || 'seedling',
      ...descriptionMeta,
      ...frontmatter
    };

    // Validate required fields
    if (!metadata.type || !['note', 'writing'].includes(metadata.type)) {
      console.warn(`Gist ${gist.id} missing valid type (note or writing)`);
      return null;
    }

    // Process content based on file type
    const isMDX = filename.endsWith('.mdx');
    let processedContent: string;
    let mdxCode: string | undefined;

    if (isMDX) {
      // Process as MDX
      const { code, frontmatter: mdxFrontmatter } = await processMDX(markdownContent);
      processedContent = ''; // MDX will be rendered client-side
      mdxCode = code;
      Object.assign(metadata, mdxFrontmatter);
    } else {
      // Process as regular markdown
      const processed = await remark()
        .use(remarkGfm)
        .use(html)
        .process(markdownContent);
      processedContent = processed.toString();
    }

    // Extract content attributes
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const title = metadata.title || this.extractTitle(markdownContent, gist.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const description = metadata.description || this.extractDescription(
      markdownContent, 
      gist.description?.replace(/#\w+/g, '').trim() || ''
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const stage = metadata.stage || this.inferStage(metadata);

    // Extract connections
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const connections = [
      ...(metadata.connections || []),
      ...this.extractConnections(markdownContent)
    ];

    // Calculate reading time
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const stats = readingTime(markdownContent);

    // Determine dates
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const planted = metadata.planted ? new Date(metadata.planted) : new Date(gist.created_at);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const tended = metadata.tended ? new Date(metadata.tended) : new Date(gist.updated_at);

    // Extract tags from description and metadata
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const tags = [
      ...(metadata.tags || []),
      ...this.extractHashtags(gist.description || '')
    ];

    return {
      html: processedContent,
      mdx: mdxCode,
    };
  }

  private hasGardenMetadata(frontmatter: Record<string, unknown>, gist: Gist): boolean {
    // Has garden tag in description
    if (gist.description && gist.description.includes('#garden')) {
      return true;
    }

    // Has type in frontmatter
    if (frontmatter.type && ['note', 'writing'].includes(frontmatter.type as string)) {
      return true;
    }

    // Has garden flag in frontmatter
    if (frontmatter.garden === true) {
      return true;
    }

    return false;
  }

  private parseDescriptionMetadata(description: string): Partial<GistMeta> {
    const meta: Partial<GistMeta> = {};

    // Extract type from hashtags
    if (description.includes('#note')) meta.type = 'note';
    if (description.includes('#writing')) meta.type = 'writing';

    // Extract stage
    if (description.includes('#seedling')) meta.stage = 'seedling';
    if (description.includes('#budding')) meta.stage = 'budding';
    if (description.includes('#evergreen')) meta.stage = 'evergreen';

    // Extract other flags
    if (description.includes('#featured')) meta.featured = true;
    if (description.includes('#draft')) meta.draft = true;

    return meta;
  }

  private extractHashtags(text: string): string[] {
    const hashtags = text.match(/#\w+/g) || [];
    return hashtags
      .map(tag => tag.slice(1)) // Remove #
      .filter(tag => !['garden', 'note', 'writing', 'seedling', 'budding', 'evergreen', 'featured', 'draft'].includes(tag));
  }

  private extractTitle(content: string, fallback: string): string {
    const match = content.match(/^#\s+(.+)$/m);
    if (match) return match[1];

    // Try to extract from first line
    const firstLine = content.trim().split('\n')[0];
    if (firstLine && !firstLine.startsWith('#')) {
      return firstLine.slice(0, 100);
    }

    return `Gist ${fallback}`;
  }

  private extractDescription(content: string, fallback: string): string {
    const paragraphs = content
      .split('\n\n')
      .filter(p => p.trim() && !p.startsWith('#') && !p.startsWith('```'));
    
    if (paragraphs.length > 0) {
      return paragraphs[0].slice(0, 200).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    }
    
    return fallback;
  }

  private inferStage(metadata: GistMeta): GrowthStage {
    // Notes default to budding
    if (metadata.type === 'note') {
      return metadata.stage || 'budding';
    }

    // Writing defaults to evergreen when published
    if (metadata.type === 'writing') {
      return metadata.stage || 'evergreen';
    }

    return 'seedling';
  }

  private extractConnections(content: string): string[] {
    const connections = new Set<string>();
    
    // Wiki-style links [[connection]]
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    let match;
    while ((match = wikiLinkRegex.exec(content)) !== null) {
      connections.add(match[1].trim());
    }
    
    return Array.from(connections);
  }
}