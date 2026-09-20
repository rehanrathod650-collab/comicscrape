import { describe, it, expect } from 'vitest';
import { Deduplicator } from '../services/deduplicator';
import { NormalizedResource } from '../connectors/types';

describe('Deduplicator Service', () => {
  it('should generate consistent SHA256 content hashes', () => {
    const resA: Partial<NormalizedResource> = {
      sourceType: 'GITHUB',
      canonicalUrl: 'https://github.com/owner/repo',
      title: 'Awesome Tool'
    };
    const resB: Partial<NormalizedResource> = {
      sourceType: 'GITHUB',
      canonicalUrl: 'https://github.com/owner/repo',
      title: 'Awesome Tool'
    };

    const hashA = Deduplicator.generateContentHash(resA);
    const hashB = Deduplicator.generateContentHash(resB);
    expect(hashA).toBe(hashB);
  });

  it('should detect exact canonical URL duplicates with confidence 1.0', () => {
    const candidate: NormalizedResource = {
      sourceType: 'GITHUB',
      externalId: 'gh_999',
      title: 'Python Automation Tool',
      description: 'Test description',
      resourceType: 'REPOSITORY',
      url: 'https://github.com/the-comic-dev/python-automation-toolkit?utm_source=twitter',
      canonicalUrl: 'https://github.com/the-comic-dev/python-automation-toolkit',
      stars: 100,
      forks: 10,
      discoveredAt: new Date(),
      contentHash: 'hash_test',
      tags: []
    };

    const existingList = [
      {
        id: 'existing_1',
        canonicalUrl: 'https://github.com/the-comic-dev/python-automation-toolkit',
        contentHash: 'some_other_hash',
        title: 'Original Title',
        externalId: 'gh_101'
      }
    ];

    const result = Deduplicator.evaluateDuplicate(candidate, existingList);
    expect(result.isDuplicate).toBe(true);
    expect(result.confidenceScore).toBe(1.0);
    expect(result.existingId).toBe('existing_1');
  });

  it('should compute high similarity for near-identical titles', () => {
    const sim = Deduplicator.computeSimilarity(
      'Python Automation Toolkit and Script Arsenal',
      'Python Automation Toolkit & Script Collection'
    );
    expect(sim).toBeGreaterThan(0.6);
  });
});
