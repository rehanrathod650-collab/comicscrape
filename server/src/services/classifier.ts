import { ResourceType } from '../connectors/types';

export class Classifier {
  /**
   * Automatically classify resource based on extension, mimeType, title, topics, and description
   */
  static classify(data: {
    extension?: string;
    mimeType?: string;
    title: string;
    description?: string;
    topics?: string[];
    isRepo?: boolean;
  }): ResourceType {
    const ext = data.extension?.toLowerCase().replace('.', '') || '';
    const mime = data.mimeType?.toLowerCase() || '';
    const title = data.title.toLowerCase();
    const desc = (data.description || '').toLowerCase();
    const topics = (data.topics || []).map(t => t.toLowerCase());

    // 1. File extension & MIME triggers
    if (ext === 'pdf' || mime.includes('pdf')) return 'PDF';
    if (['zip', 'tar', 'gz', '7z', 'rar'].includes(ext) || mime.includes('zip') || mime.includes('compressed')) return 'ZIP';
    if (['epub', 'mobi'].includes(ext) || mime.includes('epub')) return 'EBOOK';
    if (['csv', 'parquet', 'tsv'].includes(ext) || topics.includes('dataset')) return 'DATASET';
    if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext) || mime.startsWith('image/')) return 'IMAGE';
    if (['mp4', 'mkv', 'avi', 'mov'].includes(ext) || mime.startsWith('video/')) return 'VIDEO';

    // 2. Keyword triggers
    const fullText = `${title} ${desc} ${topics.join(' ')}`;

    if (fullText.includes('cheatsheet') || fullText.includes('cheat sheet') || fullText.includes('reference notes')) {
      return 'PDF';
    }
    if (fullText.includes('handbook') || fullText.includes('bible') || fullText.includes('textbook') || fullText.includes('e-book')) {
      return 'EBOOK';
    }
    if (fullText.includes('course') || fullText.includes('lecture') || fullText.includes('curriculum')) {
      return 'COURSE';
    }
    if (fullText.includes('tutorial') || fullText.includes('guide') || fullText.includes('walkthrough') || fullText.includes('how-to')) {
      return 'TUTORIAL';
    }
    if (fullText.includes('template') || fullText.includes('boilerplate') || fullText.includes('starter-kit') || fullText.includes('starter kit')) {
      return 'TEMPLATE';
    }
    if (fullText.includes('cli') || fullText.includes('toolkit') || fullText.includes('analyzer') || fullText.includes('scanner') || fullText.includes('utility')) {
      return 'TOOL';
    }
    if (fullText.includes('library') || fullText.includes('framework') || fullText.includes('sdk')) {
      return 'LIBRARY';
    }
    if (fullText.includes('documentation') || fullText.includes('docs') || fullText.includes('manual') || fullText.includes('api-reference')) {
      return 'DOCUMENTATION';
    }
    if (fullText.includes('snippet') || fullText.includes('script') || ['py', 'ts', 'js', 'go', 'rs', 'cpp', 'java'].includes(ext)) {
      return 'CODE';
    }

    if (data.isRepo) {
      return 'REPOSITORY';
    }

    return 'OTHER';
  }

  /**
   * Compute composite importance score (Prompt section 50)
   * score = relevance * popularity * freshness * quality
   */
  static computeImportanceScore(params: {
    stars: number;
    forks: number;
    publishedAt?: Date;
    hasReadme: boolean;
    hasDescription: boolean;
  }): number {
    let score = 50.0;

    // Popularity factor (logarithmic)
    if (params.stars > 0) {
      score += Math.min(30, Math.log10(params.stars + 1) * 7.5);
    }
    if (params.forks > 0) {
      score += Math.min(10, Math.log10(params.forks + 1) * 3);
    }

    // Quality signals
    if (params.hasReadme) score += 5;
    if (params.hasDescription) score += 5;

    return Math.min(100, Math.max(10, Number(score.toFixed(1))));
  }
}
