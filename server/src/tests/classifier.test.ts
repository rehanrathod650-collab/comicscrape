import { describe, it, expect } from 'vitest';
import { Classifier } from '../services/classifier';

describe('Classifier Service', () => {
  it('should classify PDF files correctly', () => {
    const type = Classifier.classify({
      title: 'Python Automation Cheatsheet',
      extension: 'pdf'
    });
    expect(type).toBe('PDF');
  });

  it('should classify ZIP archives correctly', () => {
    const type = Classifier.classify({
      title: 'K8s Offline Bundle',
      extension: 'zip'
    });
    expect(type).toBe('ZIP');
  });

  it('should classify repositories by keyword and flag', () => {
    const type = Classifier.classify({
      title: 'facebook/react',
      isRepo: true
    });
    expect(type).toBe('REPOSITORY');
  });

  it('should classify CLI tools by title keywords', () => {
    const type = Classifier.classify({
      title: 'Rust Network Packet Analyzer CLI Toolkit'
    });
    expect(type).toBe('TOOL');
  });

  it('should compute reasonable importance scores', () => {
    const scoreA = Classifier.computeImportanceScore({
      stars: 15000,
      forks: 3000,
      hasReadme: true,
      hasDescription: true
    });
    const scoreB = Classifier.computeImportanceScore({
      stars: 10,
      forks: 0,
      hasReadme: false,
      hasDescription: false
    });

    expect(scoreA).toBeGreaterThan(scoreB);
    expect(scoreA).toBeLessThanOrEqual(100);
    expect(scoreB).toBeGreaterThanOrEqual(10);
  });
});
