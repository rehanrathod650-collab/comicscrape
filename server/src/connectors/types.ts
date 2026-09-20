export type SourceType = 'GITHUB' | 'TELEGRAM';

export type ResourceType =
  | 'REPOSITORY'
  | 'CODE'
  | 'DOCUMENTATION'
  | 'TUTORIAL'
  | 'ARTICLE'
  | 'PDF'
  | 'EBOOK'
  | 'COURSE'
  | 'VIDEO'
  | 'DATASET'
  | 'TOOL'
  | 'LIBRARY'
  | 'TEMPLATE'
  | 'ZIP'
  | 'IMAGE'
  | 'LINK'
  | 'FILE'
  | 'OTHER';

export interface NormalizedResource {
  sourceType: SourceType;
  externalId: string;
  title: string;
  description: string;
  resourceType: ResourceType;
  url: string;
  canonicalUrl: string;
  author?: string;
  owner?: string;
  repository?: string;
  channel?: string;
  fileName?: string;
  fileExtension?: string;
  mimeType?: string;
  fileSize?: number;
  language?: string;
  license?: string;
  stars: number;
  forks: number;
  publishedAt?: Date;
  discoveredAt: Date;
  contentHash: string;
  dedupeScore?: number;
  isDuplicate?: boolean;
  importanceScore?: number;
  tags: string[];
  metadata?: Record<string, any>;
  readmePreview?: string;
}

export interface ConnectorSearchOptions {
  limit?: number;
  page?: number;
  language?: string;
  minStars?: number;
  channel?: string;
}

export interface IConnector {
  readonly name: string;
  readonly sourceType: SourceType;
  search(query: string, options?: ConnectorSearchOptions): Promise<NormalizedResource[]>;
  testConnection(): Promise<{ success: boolean; message: string; quota?: any }>;
}
