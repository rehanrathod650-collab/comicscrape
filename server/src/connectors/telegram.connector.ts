import axios from 'axios';
import * as cheerio from 'cheerio';
import { IConnector, NormalizedResource, ConnectorSearchOptions, SourceType } from './types';
import { Normalizer } from '../services/normalizer';
import { Deduplicator } from '../services/deduplicator';
import { Classifier } from '../services/classifier';

export class TelegramConnector implements IConnector {
  readonly name = 'Telegram Channel Connector';
  readonly sourceType: SourceType = 'TELEGRAM';

  // Curated list of real, active public developer & resource channels for discovery
  private defaultChannels = [
    'thedevs',
    'golang_news',
    'cs_resources',
    'python2day',
    'TechInterviewPrep',
    'cybersecurity_hub',
    'programmers_notes',
    'dev_pulse'
  ];

  constructor(private botToken?: string, private channels?: string[]) {
    if (channels && channels.length > 0) {
      this.defaultChannels = channels;
    }
  }

  /**
   * Search across public & authorized channels
   */
  async search(query: string, options?: ConnectorSearchOptions): Promise<NormalizedResource[]> {
    const q = query.toLowerCase().trim();
    const queryTerms = q.split(/\s+/).filter(t => t.length > 1);
    const targetChannels = options?.channel ? [options.channel] : this.defaultChannels;
    const results: NormalizedResource[] = [];

    for (const ch of targetChannels) {
      try {
        const channelItems = await this.scrapeChannelFeed(ch);
        const matched = channelItems.filter(item => {
          if (!q) return true;
          const haystack = (
            item.title + ' ' +
            item.description + ' ' +
            (item.fileName || '') + ' ' +
            item.tags.join(' ')
          ).toLowerCase();

          if (haystack.includes(q)) return true;
          return queryTerms.length > 0 && queryTerms.some(term => haystack.includes(term));
        });
        results.push(...matched);
      } catch (err) {
        // Continue to other channels if one fails
        console.warn(`Could not fetch channel ${ch}:`, (err as any).message);
      }
    }

    return results.slice(0, options?.limit || 25);
  }

  /**
   * Scrapes public channel messages via Telegram's official public preview endpoint (t.me/s/<channel>)
   */
  async scrapeChannelFeed(channelName: string): Promise<NormalizedResource[]> {
    const cleanChannel = channelName.replace(/^@/, '').trim();
    const url = `https://t.me/s/${cleanChannel}`;

    const res = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(res.data);
    const resources: NormalizedResource[] = [];

    $('.tgme_widget_message').each((_, el) => {
      const msgEl = $(el);
      const dataPost = msgEl.attr('data-post'); // e.g. "channel/123"
      if (!dataPost) return;

      const [channel, messageId] = dataPost.split('/');
      const textEl = msgEl.find('.tgme_widget_message_text');
      const text = Normalizer.sanitizeText(textEl.text());

      // Check document / media / file
      const docEl = msgEl.find('.tgme_widget_message_document');
      const docTitle = docEl.find('.tgme_widget_message_document_title').text().trim();
      const docExtra = docEl.find('.tgme_widget_message_document_extra').text().trim(); // e.g. "8.4 MB, PDF"

      // Check external links in post
      const firstLink = textEl.find('a').first().attr('href') || `https://t.me/${channel}/${messageId}`;

      const title = docTitle || text.split('\n')[0]?.slice(0, 100) || `Resource from @${channel}`;
      const description = text || (docTitle ? `File shared in @${channel}` : 'Telegram resource post');

      const ext = docTitle ? docTitle.split('.').pop() : undefined;

      // Classify
      const resourceType = Classifier.classify({
        title,
        description,
        extension: ext,
        mimeType: docExtra.includes('PDF') ? 'application/pdf' : undefined
      });

      const canonicalUrl = Normalizer.canonicalizeTelegramUrl(`https://t.me/${channel}/${messageId}`);

      // Extract hashtags
      const tags: string[] = [];
      const tagMatches = text.match(/#([a-zA-Z0-9_]+)/g);
      if (tagMatches) {
        tagMatches.forEach(t => tags.push(t.replace('#', '').toLowerCase()));
      }

      const resource: NormalizedResource = {
        sourceType: 'TELEGRAM',
        externalId: `tg_${channel}_${messageId}`,
        title,
        description,
        resourceType,
        url: `https://t.me/${channel}/${messageId}`,
        canonicalUrl,
        channel,
        fileName: docTitle || undefined,
        fileExtension: ext,
        fileSize: docExtra ? this.parseSize(docExtra) : undefined,
        stars: 0,
        forks: 0,
        publishedAt: new Date(),
        discoveredAt: new Date(),
        contentHash: '',
        importanceScore: docTitle ? 88.0 : 75.0,
        tags: tags.length > 0 ? tags : ['telegram', 'notes']
      };

      resource.contentHash = Deduplicator.generateContentHash(resource);
      resources.push(resource);
    });

    return resources;
  }

  private parseSize(extraText: string): number | undefined {
    const match = extraText.match(/([\d.]+)\s*(KB|MB|GB)/i);
    if (!match) return undefined;
    const num = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    if (unit === 'KB') return Math.round(num * 1024);
    if (unit === 'MB') return Math.round(num * 1024 * 1024);
    if (unit === 'GB') return Math.round(num * 1024 * 1024 * 1024);
    return undefined;
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const testChannel = this.defaultChannels[0];
      const res = await axios.head(`https://t.me/s/${testChannel}`, { timeout: 5000 });
      return {
        success: res.status === 200,
        message: `Successfully connected to Telegram public channel gateway (@${testChannel})`
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Telegram connection test failed'
      };
    }
  }
}
