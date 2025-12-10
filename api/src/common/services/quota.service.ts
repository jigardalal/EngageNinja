import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PlanTierService } from './plan-tier.service';
import { UsageCounter } from '@prisma/client';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';

export enum UsageType {
  MonthlySends = 'monthly_sends',
  AiTokens = 'ai_tokens',
}

export interface QuotaCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  message?: string;
}

export interface UsageData {
  current: number;
  limit: number;
  percentage: number;
  resetDate?: Date;
}

@Injectable()
export class QuotaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly planTierService: PlanTierService,
  ) {}

  /**
   * Get or create current period counter for a tenant
   */
  async getCurrentCounter(tenantId: string, usageType: UsageType): Promise<UsageCounter> {
    const now = new Date();
    const periodStart = startOfMonth(now);
    const periodEnd = endOfMonth(now);

    let counter = await this.prisma.usageCounter.findUnique({
      where: {
        tenantId_usageType_periodStart: {
          tenantId,
          usageType,
          periodStart,
        },
      },
    });

    if (!counter) {
      counter = await this.prisma.usageCounter.create({
        data: {
          tenantId,
          usageType,
          periodStart,
          periodEnd,
          count: 0,
        },
      });
    }

    return counter;
  }

  /**
   * Check if quota is available before an operation
   */
  async checkQuota(
    tenantId: string,
    planTierName: string,
    usageType: UsageType,
    amount: number = 1,
  ): Promise<QuotaCheckResult> {
    const plan = await this.planTierService.getPlanLimits(planTierName);
    if (!plan) {
      return {
        allowed: false,
        current: 0,
        limit: 0,
        message: 'Invalid plan tier',
      };
    }

    const limit =
      usageType === UsageType.MonthlySends ? plan.maxMonthlySends : plan.maxAiTokensMonthly;

    const counter = await this.getCurrentCounter(tenantId, usageType);
    const newTotal = counter.count + amount;

    if (newTotal > limit) {
      return {
        allowed: false,
        current: counter.count,
        limit,
        message: `Quota exceeded: ${counter.count}/${limit} ${usageType} used this month`,
      };
    }

    return { allowed: true, current: counter.count, limit };
  }

  /**
   * Increment usage counter (call this AFTER successful operation)
   */
  async incrementUsage(
    tenantId: string,
    usageType: UsageType,
    amount: number = 1,
    metadata?: any,
  ): Promise<UsageCounter> {
    const counter = await this.getCurrentCounter(tenantId, usageType);

    return this.prisma.usageCounter.update({
      where: { id: counter.id },
      data: {
        count: { increment: amount },
        metadata: metadata ?? counter.metadata,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Get current usage for a tenant with plan limits
   */
  async getUsage(tenantId: string, usageType: UsageType): Promise<UsageData> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { settings: true },
    });

    const planTierName = tenant?.settings?.planTier || 'starter';
    const plan = await this.planTierService.getPlanLimits(planTierName);

    const limit = usageType === UsageType.MonthlySends ? plan?.maxMonthlySends || 0 : plan?.maxAiTokensMonthly || 0;

    const counter = await this.getCurrentCounter(tenantId, usageType);
    const percentage = limit > 0 ? (counter.count / limit) * 100 : 0;
    const resetDate = endOfMonth(new Date());

    return {
      current: counter.count,
      limit,
      percentage: Math.min(percentage, 100),
      resetDate,
    };
  }

  /**
   * Get usage data for all tracked metrics
   */
  async getAllUsage(tenantId: string): Promise<{
    monthlySends: UsageData;
    aiTokens: UsageData;
  }> {
    return {
      monthlySends: await this.getUsage(tenantId, UsageType.MonthlySends),
      aiTokens: await this.getUsage(tenantId, UsageType.AiTokens),
    };
  }

  /**
   * Reset usage counters for a specific tenant and usage type
   * Called when a new billing period starts
   * Passive reset: new counters are created on first usage of the new period
   */
  async resetMonthlyCounters(): Promise<void> {
    const now = new Date();
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // In a passive reset model, old counters remain for audit purposes
    // New counters will be automatically created via getCurrentCounter()
    // when tenants use services in the new billing period

    // Optionally log that reset occurred
    console.log(`[QuotaService] Monthly reset complete at ${now.toISOString()}`);
  }

  /**
   * Get a specific usage counter record
   */
  async getCounter(
    tenantId: string,
    usageType: UsageType,
    periodStart?: Date,
  ): Promise<UsageCounter | null> {
    const period = periodStart || startOfMonth(new Date());

    return this.prisma.usageCounter.findUnique({
      where: {
        tenantId_usageType_periodStart: {
          tenantId,
          usageType,
          periodStart: period,
        },
      },
    });
  }

  /**
   * Get usage history for a tenant across multiple periods
   */
  async getUsageHistory(
    tenantId: string,
    usageType: UsageType,
    months: number = 12,
  ): Promise<UsageCounter[]> {
    const now = new Date();
    const startDate = subMonths(now, months - 1);
    const startPeriod = startOfMonth(startDate);

    return this.prisma.usageCounter.findMany({
      where: {
        tenantId,
        usageType,
        periodStart: {
          gte: startPeriod,
        },
      },
      orderBy: {
        periodStart: 'asc',
      },
    });
  }
}
