import { prisma } from '../db/client';
import { GitHubConnector } from '../connectors/github.connector';
import { TelegramConnector } from '../connectors/telegram.connector';
import { Deduplicator } from './deduplicator';
import { NormalizedResource, SourceType } from '../connectors/types';

export interface EnqueueJobParams {
  type: string;
  query: string;
  sources: SourceType[];
  schedule?: string;
}

export class JobQueue {
  private static isProcessing = false;
  private static queue: string[] = [];

  /**
   * Add a new discovery job
   */
  static async enqueue(params: EnqueueJobParams) {
    const job = await prisma.scraperJob.create({
      data: {
        type: params.type,
        query: params.query,
        sources: params.sources.join(','),
        status: 'QUEUED',
        progress: 0,
        currentTask: 'Queued in worker pipeline...',
        schedule: params.schedule,
        logs: JSON.stringify([
          {
            timestamp: new Date().toLocaleTimeString(),
            step: 'Queue',
            message: `Job initialized for "${params.query}" on ${params.sources.join(' & ')}`
          }
        ])
      }
    });

    this.queue.push(job.id);
    this.processNext();
    return job;
  }

  /**
   * Worker loop
   */
  private static async processNext() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const jobId = this.queue.shift();
    if (!jobId) {
      this.isProcessing = false;
      return;
    }

    try {
      await this.executeJob(jobId);
    } catch (err: any) {
      console.error(`Error executing job ${jobId}:`, err);
      await this.appendLog(jobId, 'Error', err.message || 'Job execution failure', 'FAILED');
    } finally {
      this.isProcessing = false;
      if (this.queue.length > 0) {
        setImmediate(() => this.processNext());
      }
    }
  }

  /**
   * Execute discovery job
   */
  private static async executeJob(jobId: string) {
    const job = await prisma.scraperJob.findUnique({ where: { id: jobId } });
    if (!job) return;

    await prisma.scraperJob.update({
      where: { id: jobId },
      data: {
        status: 'RUNNING',
        progress: 10,
        currentTask: `Connecting collectors for "${job.query}"...`,
        startedAt: new Date()
      }
    });

    const sources: SourceType[] = job.sources.split(',') as SourceType[];
    const githubConnector = new GitHubConnector(process.env.GITHUB_TOKEN);
    const telegramConnector = new TelegramConnector(process.env.TELEGRAM_BOT_TOKEN);

    let candidates: NormalizedResource[] = [];

    // Step 1: Collect from GitHub
    if (sources.includes('GITHUB')) {
      await this.appendLog(jobId, 'GitHub Hunt', `Scanning GitHub for "${job.query}"...`);
      try {
        const ghResults = await githubConnector.search(job.query, { limit: 25 });
        candidates.push(...ghResults);
        await this.appendLog(jobId, 'GitHub Found', `Discovered ${ghResults.length} candidate repositories.`);
      } catch (e: any) {
        await this.appendLog(jobId, 'GitHub Warning', e.message);
      }
    }

    await this.updateProgress(jobId, 45, 'Querying Telegram authorized feeds...');

    // Step 2: Collect from Telegram
    if (sources.includes('TELEGRAM')) {
      await this.appendLog(jobId, 'Telegram Hunt', `Scanning authorized Telegram channels for "${job.query}"...`);
      try {
        const tgResults = await telegramConnector.search(job.query, { limit: 25 });
        candidates.push(...tgResults);
        await this.appendLog(jobId, 'Telegram Found', `Discovered ${tgResults.length} posts and media files.`);
      } catch (e: any) {
        await this.appendLog(jobId, 'Telegram Warning', e.message);
      }
    }

    await this.updateProgress(jobId, 75, 'Running deduplication and classification...');

    // Step 3: Deduplicate against existing catalog
    const existingResources = await prisma.resource.findMany({
      select: { id: true, canonicalUrl: true, contentHash: true, title: true, externalId: true }
    });

    let savedCount = 0;
    let duplicateCount = 0;

    for (const candidate of candidates) {
      const dedupeResult = Deduplicator.evaluateDuplicate(candidate, existingResources);

      if (dedupeResult.isDuplicate) {
        duplicateCount++;
        continue;
      }

      const queryTerms = job.query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
      const allTags = Array.from(new Set([...candidate.tags, job.query.toLowerCase(), ...queryTerms])).join(',');

      // Persist new unique resource
      await prisma.resource.create({
        data: {
          sourceType: candidate.sourceType,
          externalId: candidate.externalId,
          title: candidate.title,
          description: candidate.description,
          resourceType: candidate.resourceType,
          url: candidate.url,
          canonicalUrl: candidate.canonicalUrl,
          author: candidate.author,
          owner: candidate.owner,
          repository: candidate.repository,
          channel: candidate.channel,
          fileName: candidate.fileName,
          fileExtension: candidate.fileExtension,
          mimeType: candidate.mimeType,
          fileSize: candidate.fileSize,
          language: candidate.language,
          license: candidate.license,
          stars: candidate.stars,
          forks: candidate.forks,
          publishedAt: candidate.publishedAt,
          discoveredAt: candidate.discoveredAt,
          contentHash: candidate.contentHash,
          dedupeScore: dedupeResult.confidenceScore,
          isDuplicate: false,
          isDemo: false,
          importanceScore: candidate.importanceScore || 75.0,
          tags: allTags,
          readmePreview: candidate.readmePreview
        }
      });

      // Update in-memory existing list for intra-batch deduplication
      existingResources.push({
        id: `batch_${savedCount}`,
        canonicalUrl: candidate.canonicalUrl,
        contentHash: candidate.contentHash,
        title: candidate.title,
        externalId: candidate.externalId
      });

      savedCount++;
    }

    // If all candidates on page 1 were already indexed, fetch page 2 to discover fresh resources
    if (savedCount === 0 && sources.includes('GITHUB')) {
      await this.appendLog(jobId, 'Deeper Search', 'Top candidates already indexed. Scanning page 2 for fresh repositories...');
      try {
        const moreCandidates = await githubConnector.search(job.query, { page: 2, limit: 25 });
        for (const candidate of moreCandidates) {
          const dedupeResult = Deduplicator.evaluateDuplicate(candidate, existingResources);
          if (dedupeResult.isDuplicate) {
            duplicateCount++;
            continue;
          }
          const queryTerms = job.query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
          const allTags = Array.from(new Set([...candidate.tags, job.query.toLowerCase(), ...queryTerms])).join(',');

          await prisma.resource.create({
            data: {
              sourceType: candidate.sourceType,
              externalId: candidate.externalId,
              title: candidate.title,
              description: candidate.description,
              resourceType: candidate.resourceType,
              url: candidate.url,
              canonicalUrl: candidate.canonicalUrl,
              author: candidate.author,
              owner: candidate.owner,
              repository: candidate.repository,
              channel: candidate.channel,
              fileName: candidate.fileName,
              fileExtension: candidate.fileExtension,
              mimeType: candidate.mimeType,
              fileSize: candidate.fileSize,
              language: candidate.language,
              license: candidate.license,
              stars: candidate.stars,
              forks: candidate.forks,
              publishedAt: candidate.publishedAt,
              discoveredAt: candidate.discoveredAt,
              contentHash: candidate.contentHash,
              dedupeScore: dedupeResult.confidenceScore,
              isDuplicate: false,
              isDemo: false,
              importanceScore: candidate.importanceScore || 75.0,
              tags: allTags,
              readmePreview: candidate.readmePreview
            }
          });

          existingResources.push({
            id: `batch_${savedCount}`,
            canonicalUrl: candidate.canonicalUrl,
            contentHash: candidate.contentHash,
            title: candidate.title,
            externalId: candidate.externalId
          });
          savedCount++;
        }
      } catch {}
    }

    await this.appendLog(
      jobId,
      'Deduplication',
      `Identified ${duplicateCount} duplicates. Added ${savedCount} fresh resources to the index.`
    );

    // Step 4: Complete Job
    await prisma.scraperJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        currentTask: `Hunt finished! ${savedCount} new resources indexed.`,
        resourcesFound: savedCount,
        duplicatesFound: duplicateCount,
        completedAt: new Date()
      }
    });

    // Create system notification
    if (savedCount > 0) {
      await prisma.notification.create({
        data: {
          title: 'Hunt Complete',
          message: `${savedCount} new resources indexed for query "${job.query}".`,
          type: 'SUCCESS',
          link: '/resources'
        }
      });
    }
  }

  private static async updateProgress(jobId: string, progress: number, currentTask: string) {
    await prisma.scraperJob.update({
      where: { id: jobId },
      data: { progress, currentTask }
    });
  }

  private static async appendLog(jobId: string, step: string, message: string, newStatus?: string) {
    const job = await prisma.scraperJob.findUnique({ where: { id: jobId } });
    if (!job) return;

    let logs: any[] = [];
    try {
      logs = job.logs ? JSON.parse(job.logs) : [];
    } catch {}

    logs.push({
      timestamp: new Date().toLocaleTimeString(),
      step,
      message
    });

    await prisma.scraperJob.update({
      where: { id: jobId },
      data: {
        logs: JSON.stringify(logs),
        ...(newStatus ? { status: newStatus } : {})
      }
    });
  }
}
