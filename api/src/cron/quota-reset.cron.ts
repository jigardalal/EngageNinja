import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QuotaService } from '../common/services/quota.service';

@Injectable()
export class QuotaResetCron {
  private readonly logger = new Logger(QuotaResetCron.name);

  constructor(private quotaService: QuotaService) {}

  /**
   * Reset monthly usage counters on the first day of each month at midnight UTC.
   * This CRON job runs every month: 0 0 1 * * (00:00 on the 1st of every month)
   *
   * The QuotaService.resetMonthlyCounters() method handles creating new counters
   * for the current month if they don't exist. Existing counters are left unchanged
   * to maintain usage history across month boundaries.
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleMonthlyQuotaReset() {
    this.logger.log('Starting monthly quota counter reset...');
    try {
      await this.quotaService.resetMonthlyCounters();
      this.logger.log('Monthly quota counter reset completed successfully');
    } catch (error) {
      this.logger.error('Failed to reset monthly quota counters', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Don't throw - let the CRON job fail silently to avoid preventing other jobs
    }
  }
}
