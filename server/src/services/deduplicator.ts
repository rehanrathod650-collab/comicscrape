import crypto from 'crypto';
import { NormalizedResource } from '../connectors/types';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  confidenceScore: number;
  matchedReason?: string;
  existingId?: string;
}

export class Deduplicator {
  /**
   * Generate a cryptographic SHA256 content hash fingerprint
   */
  static generateContentHash(resource: Partial<NormalizedResource>): string {
    const canonical = resource.canonicalUrl?.toLowerCase().trim() || '';
    const title = resource.title?.toLowerCase().replace(/\s+/g, ' ').trim() || '';
    const raw = `${resource.sourceType}:${canonical}:${title}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  /**
   * Compute Sorensen-Dice word-level similarity between two strings
   */
  static computeSimilarity(a: string, b: string): number {
    const wordsA = new Set(a.toLowerCase().split(/[\s,._-]+/).filter(w => w.length > 2));
    const wordsB = new Set(b.toLowerCase().split(/[\s,._-]+/).filter(w => w.length > 2));

    if (wordsA.size === 0 || wordsB.size === 0) return 0.0;

    let common = 0;
    for (const w of wordsA) {
      if (wordsB.has(w)) common++;
    }

    // Sorensen-Dice formula: (2 * |A ∩ B|) / (|A| + |B|)
    return (2 * common) / (wordsA.size + wordsB.size);
  }

  /**
   * Check if a candidate resource is a duplicate against an existing catalog
   */
  static evaluateDuplicate(
    candidate: NormalizedResource,
    existingList: { id: string; canonicalUrl: string; contentHash: string; title: string; externalId: string }[]
  ): DuplicateCheckResult {
    // 1. Exact canonical URL match -> 1.0 confidence
    const exactUrl = existingList.find(e => e.canonicalUrl.toLowerCase() === candidate.canonicalUrl.toLowerCase());
    if (exactUrl) {
      return {
        isDuplicate: true,
        confidenceScore: 1.0,
        matchedReason: 'Exact canonical URL match',
        existingId: exactUrl.id
      };
    }

    // 2. Exact content hash match -> 1.0 confidence
    const exactHash = existingList.find(e => e.contentHash === candidate.contentHash);
    if (exactHash) {
      return {
        isDuplicate: true,
        confidenceScore: 1.0,
        matchedReason: 'Identical SHA-256 fingerprint',
        existingId: exactHash.id
      };
    }

    // 3. Exact external ID for same source
    const exactExt = existingList.find(e => e.externalId === candidate.externalId);
    if (exactExt) {
      return {
        isDuplicate: true,
        confidenceScore: 0.98,
        matchedReason: 'Matching external identifier',
        existingId: exactExt.id
      };
    }

    // 4. Fuzzy title similarity match
    for (const existing of existingList) {
      const sim = this.computeSimilarity(candidate.title, existing.title);
      if (sim >= 0.85) {
        return {
          isDuplicate: true,
          confidenceScore: Number(sim.toFixed(2)),
          matchedReason: `High title word similarity (${Math.round(sim * 100)}%)`,
          existingId: existing.id
        };
      }
    }

    return {
      isDuplicate: false,
      confidenceScore: 0.0
    };
  }
}
