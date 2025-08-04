import { Octokit } from '@octokit/rest';
import type { Repository, Gist } from '@/types';
import { CacheManager } from '@/lib/cache/manager';

export class CachedGitHubClient {
  private octokit: Octokit;
  private owner: string;
  private cache: CacheManager;

  constructor(token: string, owner: string, cacheTTL?: number) {
    this.octokit = new Octokit({ auth: token });
    this.owner = owner;
    this.cache = new CacheManager(cacheTTL);
  }

  async fetchUserRepos(): Promise<Repository[]> {
    const cacheKey = `repos:user:${this.owner}`;
    
    // Try to get from cache first
    const cached = await this.cache.get<Repository[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Fetch from API
    const repos = await this.octokit.paginate(
      this.octokit.repos.listForUser,
      {
        username: this.owner,
        per_page: 100,
        type: 'owner',
      }
    );
    
    // Cache the result
    await this.cache.set(cacheKey, repos);
    
    return repos as Repository[];
  }

  async fetchOrgRepos(org: string): Promise<Repository[]> {
    const cacheKey = `repos:org:${org}`;
    
    const cached = await this.cache.get<Repository[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const repos = await this.octokit.paginate(
      this.octokit.repos.listForOrg,
      {
        org,
        per_page: 100,
      }
    );
    
    await this.cache.set(cacheKey, repos);
    
    return repos as Repository[];
  }

  async fetchRepoContent(repo: string, path: string): Promise<string> {
    const cacheKey = `content:${this.owner}:${repo}:${path}`;
    
    const cached = await this.cache.get<string>(cacheKey);
    if (cached !== null && cached !== undefined) {
      // Don't return cached empty strings for seed meta files
      // This allows us to detect newly added seed directories
      if (cached === '' && (path.endsWith('.seed/meta.yml') || path.endsWith('.seed/meta.json'))) {
        // Skip cache for empty seed meta files
      } else {
        return cached;
      }
    }
    
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo,
        path,
      });

      if ('content' in data && data.type === 'file') {
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        await this.cache.set(cacheKey, content);
        return content;
      }
      
      throw new Error('Not a file');
    } catch {
      // For seed meta files, don't cache missing files
      // This allows detection when they're added later
      if (!path.endsWith('.seed/meta.yml') && !path.endsWith('.seed/meta.json')) {
        await this.cache.set(cacheKey, '');
      }
      return '';
    }
  }

  async fetchRepoTree(repo: string): Promise<Array<{ path: string; type: string }>> {
    const cacheKey = `tree:${this.owner}:${repo}`;
    
    const cached = await this.cache.get<Array<{ path: string; type: string }>>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const { data } = await this.octokit.git.getTree({
      owner: this.owner,
      repo,
      tree_sha: 'HEAD',
      recursive: 'true',
    });
    
    await this.cache.set(cacheKey, data.tree);
    
    return data.tree;
  }

  async fetchUserGists(): Promise<Gist[]> {
    const cacheKey = `gists:${this.owner}`;
    
    const cached = await this.cache.get<Gist[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const gists = await this.octokit.paginate(
      this.octokit.gists.listForUser,
      {
        username: this.owner,
        per_page: 100,
      }
    );
    
    await this.cache.set(cacheKey, gists);
    
    return gists as Gist[];
  }

  async fetchGist(gistId: string): Promise<Gist> {
    const cacheKey = `gist:${gistId}`;
    
    const cached = await this.cache.get<Gist>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const { data } = await this.octokit.gists.get({
      gist_id: gistId,
    });
    
    await this.cache.set(cacheKey, data);
    
    return data as Gist;
  }

  async fetchGistContent(gistId: string, filename: string): Promise<string> {
    const cacheKey = `gist:content:${gistId}:${filename}`;
    
    const cached = await this.cache.get<string>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    const gist = await this.fetchGist(gistId);
    const file = gist.files[filename];
    
    if (file && file.content) {
      await this.cache.set(cacheKey, file.content);
      return file.content;
    }
    
    // If content is truncated, fetch from raw_url
    if (file && file.raw_url) {
      const response = await fetch(file.raw_url);
      const content = await response.text();
      await this.cache.set(cacheKey, content);
      return content;
    }
    
    await this.cache.set(cacheKey, '');
    return '';
  }

  // Helper method to clear cache for specific resources
  async clearCache(pattern?: string): Promise<void> {
    if (!pattern) {
      await this.cache.clear();
    }
    // For pattern-based clearing, we'd need to enhance CacheManager
  }
}