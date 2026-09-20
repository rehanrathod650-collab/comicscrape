import { prisma } from '../db/client';
import { JobQueue } from './queue';
import { SourceType } from '../connectors/types';

export class SchedulerService {
  private static intervalTimer: NodeJS.Timeout | null = null;

  /**
   * Start periodic scheduler checks (runs every 60 seconds)
   */
  static start() {
    if (this.intervalTimer) return;
    console.log('⏰ Scheduler service started: monitoring recurring discovery jobs & saved searches.');

    this.intervalTimer = setInterval(async () => {
      try {
        await this.checkScheduledSearches();
      } catch (err: any) {
        console.error('Scheduler tick error:', err.message);
      }
    }, 60000);
  }

  /**
   * Stop scheduler
   */
  static stop() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  /**
   * Check saved searches and trigger automatic discovery runs
   */
  static async checkScheduledSearches() {
    const now = new Date();
    const searches = await prisma.savedSearch.findMany();

    for (const item of searches) {
      let shouldRun = false;
      const lastRun = item.lastRunAt ? new Date(item.lastRunAt).getTime() : 0;
      const elapsedMs = now.getTime() - lastRun;

      switch (item.frequency) {
        case 'HOURLY':
          shouldRun = elapsedMs >= 60 * 60 * 1000;
          break;
        case 'DAILY':
          shouldRun = elapsedMs >= 24 * 60 * 60 * 1000;
          break;
        case 'WEEKLY':
          shouldRun = elapsedMs >= 7 * 24 * 60 * 60 * 1000;
          break;
        default:
          shouldRun = false;
          break;
      }

      if (shouldRun) {
        console.log(`⏰ Triggering scheduled discovery for query "${item.query}" (${item.frequency})`);
        
        await prisma.savedSearch.update({
          where: { id: item.id },
          data: { lastRunAt: now }
        });

        const sources = (item.sources ? item.sources.split(',') : ['GITHUB', 'TELEGRAM']) as SourceType[];

        await JobQueue.enqueue({
          type: 'SCHEDULED_DISCOVERY',
          query: item.query,
          sources,
          schedule: item.frequency
        });
      }
    }
  }
}
