import axios, { AxiosInstance } from 'axios';
import { IConnector, NormalizedResource, ConnectorSearchOptions, SourceType } from './types';
import { Normalizer } from '../services/normalizer';
import { Deduplicator } from '../services/deduplicator';
import { Classifier } from '../services/classifier';

export class GitHubConnector implements IConnector {
  readonly name = 'GitHub Official Connector';
  readonly sourceType: SourceType = 'GITHUB';
  private client: AxiosInstance;

  constructor(private token?: string) {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'ComicScrape-Discovery-Bot/1.0'
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers,
      timeout: 10000
    });
  }

  /**
   * Search repositories via official GitHub API
   */
  async search(query: string, options?: ConnectorSearchOptions): Promise<NormalizedResource[]> {
    try {
      const limit = options?.limit || 20;
      const page = options?.page || 1;

      let q = query.trim();
      if (options?.language) {
        q += ` language:${options.language}`;
      }
      if (options?.minStars) {
        q += ` stars:>=${options.minStars}`;
      }

      const res = await this.client.get('/search/repositories', {
        params: {
          q,
          per_page: limit,
          page,
          sort: 'stars',
          order: 'desc'
        }
      });

      const items = res.data.items || [];
      const normalizedList: NormalizedResource[] = [];

      for (const item of items) {
        const canonicalUrl = Normalizer.canonicalizeGithubUrl(item.html_url);
        const title = item.name ? `${item.owner.login}/${item.name}` : item.full_name;
        const description = Normalizer.sanitizeText(item.description || '');
        const topics: string[] = item.topics || [];

        const resourceType = Classifier.classify({
          title,
          description,
          topics,
          isRepo: true
        });

        const importanceScore = Classifier.computeImportanceScore({
          stars: item.stargazers_count,
          forks: item.forks_count,
          publishedAt: new Date(item.created_at),
          hasReadme: true,
          hasDescription: !!item.description
        });

        const normalized: NormalizedResource = {
          sourceType: 'GITHUB',
          externalId: item.id.toString(),
          title,
          description,
          resourceType,
          url: item.html_url,
          canonicalUrl,
          author: item.owner?.login,
          owner: item.owner?.login,
          repository: item.name,
          language: item.language || undefined,
          license: item.license?.spdx_id || item.license?.name || undefined,
          stars: item.stargazers_count || 0,
          forks: item.forks_count || 0,
          publishedAt: item.created_at ? new Date(item.created_at) : undefined,
          discoveredAt: new Date(),
          contentHash: '',
          importanceScore,
          tags: topics.slice(0, 8),
          metadata: {
            default_branch: item.default_branch,
            open_issues: item.open_issues_count,
            visibility: item.visibility
          }
        };

        normalized.contentHash = Deduplicator.generateContentHash(normalized);
        normalizedList.push(normalized);
      }

      return normalizedList;
    } catch (err: any) {
      if (err.response?.status === 403 || err.response?.status === 429) {
        console.warn('⚠️ GitHub API Rate Limit reached. Falling back gracefully.');
        throw new Error('GitHub rate limit reached. Please wait or provide a GITHUB_TOKEN in settings.');
      }
      console.error('GitHub search error:', err.message);
      return [];
    }
  }

  /**
   * Fetch README markdown for a repository
   */
  async getReadme(owner: string, repo: string): Promise<string | null> {
    try {
      const res = await this.client.get(`/repos/${owner}/${repo}/readme`, {
        headers: { Accept: 'application/vnd.github.raw' }
      });
      return typeof res.data === 'string' ? res.data.slice(0, 5000) : null;
    } catch {
      return null;
    }
  }

  /**
   * Test connection and check quota
   */
  async testConnection(): Promise<{ success: boolean; message: string; quota?: any }> {
    try {
      const res = await this.client.get('/rate_limit');
      const core = res.data?.resources?.core;
      return {
        success: true,
        message: 'Connected to official GitHub API',
        quota: {
          limit: core?.limit,
          remaining: core?.remaining,
          reset: core?.reset ? new Date(core.reset * 1000).toLocaleTimeString() : undefined
        }
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to connect to GitHub API'
      };
    }
  }
}
