import { describe, it, expect } from 'vitest';
import { Normalizer } from '../services/normalizer';

describe('Normalizer Service', () => {
  it('should strip tracking and marketing query parameters', () => {
    const raw = 'https://github.com/the-comic-dev/python-toolkit?utm_source=twitter&utm_medium=social&ref=producthunt';
    const cleaned = Normalizer.cleanUrl(raw);
    expect(cleaned).toBe('https://github.com/the-comic-dev/python-toolkit');
  });

  it('should canonicalize GitHub URLs to lowercase without .git or trailing slash', () => {
    const url1 = 'https://github.com/The-Comic-Dev/Python-Toolkit.git/';
    const url2 = 'https://github.com/the-comic-dev/python-toolkit?source=feed';

    expect(Normalizer.canonicalizeGithubUrl(url1)).toBe('https://github.com/the-comic-dev/python-toolkit');
    expect(Normalizer.canonicalizeGithubUrl(url2)).toBe('https://github.com/the-comic-dev/python-toolkit');
  });

  it('should canonicalize Telegram URLs to lowercase channel format', () => {
    const raw = 'https://t.me/PythonResourcesDaily/90112?utm_source=tg';
    expect(Normalizer.canonicalizeTelegramUrl(raw)).toBe('https://t.me/pythonresourcesdaily/90112');
  });

  it('should generate clean slugs for tags', () => {
    expect(Normalizer.slugify('Machine Learning 101!')).toBe('machine-learning-101');
    expect(Normalizer.slugify('C++ / Rust')).toBe('c-rust');
  });
});
