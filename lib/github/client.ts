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
    } catch {
      return '';
    }
  }

  async fetchRepoTree(repo: string): Promise<Array<{ path: string; type: string }>> {
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

  async fetchGistContent(gistId: string, filename: string): Promise<string> {
    const gist = await this.fetchGist(gistId);
    const file = gist.files[filename];
    
    if (file && file.content) {
      return file.content;
    }
    
    // If content is truncated, fetch from raw_url
    if (file && file.raw_url) {
      const response = await fetch(file.raw_url);
      return await response.text();
    }
    
    return '';
  }
}