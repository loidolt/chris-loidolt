import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import readingTime from 'reading-time';
import { GitHubClient } from '@/lib/github/client';
import type { Repository, Content, ContentType, GrowthStage } from '@/types';

export class ContentProcessor {
  private client: GitHubClient;

  constructor(client: GitHubClient) {
    this.client = client;
  }

  async processRepository(repo: Repository): Promise<Content | null> {
    try {
      // Fetch README
      const readme = await this.fetchReadme(repo.name);
      if (!readme) return null;

      // Fetch metadata
      const metadata = await this.fetchMetadata(repo.name);

      // Process content
      const processed = await this.processContent(readme, metadata, repo);
      
      return processed;
    } catch (error) {
      console.error(`Error processing ${repo.name}:`, error);
      return null;
    }
  }

  private async fetchReadme(repo: string): Promise<string | null> {
    const possiblePaths = ['README.md', 'readme.md', 'README.MD'];
    
    for (const path of possiblePaths) {
      const content = await this.client.fetchRepoContent(repo, path);
      if (content) return content;
    }
    
    return null;
  }

  private async fetchMetadata(repo: string): Promise<Record<string, unknown>> {
    const content = await this.client.fetchRepoContent(repo, 'metadata.json');
    
    if (content) {
      try {
        return JSON.parse(content);
      } catch {
        return {};
      }
    }
    
    return {};
  }

  private async processContent(
    readme: string,
    metadata: Record<string, unknown>,
    repo: Repository
  ): Promise<Content> {
    // Parse frontmatter
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: frontmatter, content: markdownContent } = matter(readme);
    
    // Convert markdown to HTML
    const processedContent = await remark()
      .use(html)
      .process(markdownContent);
    
    // Extract title
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const title = this.extractTitle(markdownContent, repo.name);
    
    // Determine content type and stage
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const type = this.determineType(repo.topics);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const stage = this.determineStage(repo.topics, metadata);
    
    // Extract connections
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const connections = this.extractConnections(markdownContent);
    
    // Calculate reading time
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const stats = readingTime(markdownContent);
    
    return {
      html: processedContent.toString(),
    };
  }

  private extractTitle(content: string, fallback: string): string {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1] : fallback;
  }

  private determineType(topics: string[]): ContentType {
    const types: ContentType[] = ['project', 'note', 'writing', 'experiment'];
    
    for (const type of types) {
      if (topics.includes(type)) return type;
    }
    
    return 'note';
  }

  private determineStage(topics: string[], metadata: Record<string, unknown>): GrowthStage {
    if (metadata.stage) return metadata.stage as GrowthStage;
    
    const stages: GrowthStage[] = ['sprout', 'sapling', 'mature'];
    
    for (const stage of stages) {
      if (topics.includes(stage)) return stage;
    }
    
    return 'sprout';
  }

  private extractConnections(content: string): string[] {
    const connections: string[] = [];
    const linkRegex = /\[\[([^\]]+)\]\]/g;
    
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      connections.push(match[1]);
    }
    
    return [...new Set(connections)];
  }
}