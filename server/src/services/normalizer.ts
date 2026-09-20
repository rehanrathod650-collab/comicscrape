export class Normalizer {
  /**
   * Strip marketing and tracking query parameters from any URL
   */
  static cleanUrl(rawUrl: string): string {
    if (!rawUrl) return '';
    try {
      const parsed = new URL(rawUrl.trim());

      // Tracking parameters to strip
      const trackingParams = [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'ref',
        'ref_src',
        'fbclid',
        'gclid',
        'source',
        'feature',
        'origin'
      ];

      for (const param of trackingParams) {
        parsed.searchParams.delete(param);
      }

      // Remove empty hash fragments
      if (parsed.hash === '#') {
        parsed.hash = '';
      }

      let cleaned = parsed.toString();
      // Remove trailing slash if not root
      if (cleaned.endsWith('/') && parsed.pathname !== '/') {
        cleaned = cleaned.slice(0, -1);
      }
      return cleaned;
    } catch {
      return rawUrl.trim();
    }
  }

  /**
   * Canonicalize GitHub repository URL:
   * e.g. https://github.com/Owner/Repo.git/ -> https://github.com/owner/repo
   */
  static canonicalizeGithubUrl(rawUrl: string): string {
    const cleaned = this.cleanUrl(rawUrl);
    const match = cleaned.match(/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/i);
    if (match) {
      const owner = match[1].toLowerCase();
      let repo = match[2].toLowerCase();
      if (repo.endsWith('.git')) {
        repo = repo.slice(0, -4);
      }
      return `https://github.com/${owner}/${repo}`;
    }
    return cleaned;
  }

  /**
   * Canonicalize Telegram URL:
   * e.g. https://t.me/Channel_Name/123 -> https://t.me/channel_name/123
   */
  static canonicalizeTelegramUrl(rawUrl: string): string {
    const cleaned = this.cleanUrl(rawUrl);
    const match = cleaned.match(/t\.me\/([a-zA-Z0-9_]+)\/(\d+)/i);
    if (match) {
      const channel = match[1].toLowerCase();
      const messageId = match[2];
      return `https://t.me/${channel}/${messageId}`;
    }
    return cleaned;
  }

  /**
   * Generate clean slug for tags: e.g. "Machine Learning" -> "machine-learning"
   */
  static slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Sanitize text content to prevent XSS / malicious injection
   */
  static sanitizeText(text?: string): string {
    if (!text) return '';
    return text
      .trim()
      .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '');
  }
}
