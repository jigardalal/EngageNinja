import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PlanTier as PlanTierModel } from '@prisma/client';

@Injectable()
export class PlanTierService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get plan tier limits from database
   */
  async getPlanLimits(planTierName: string): Promise<PlanTierModel | null> {
    return this.prisma.planTier.findUnique({
      where: { name: planTierName },
    });
  }

  /**
   * Get all plan tiers
   */
  async getAllPlanTiers(): Promise<PlanTierModel[]> {
    return this.prisma.planTier.findMany({
      orderBy: { maxMonthlySends: 'asc' },
    });
  }

  /**
   * Validate if user can create another tenant
   */
  async validateTenantLimit(userId: string, planTierName: string): Promise<boolean> {
    const plan = await this.getPlanLimits(planTierName);
    if (!plan) return false;

    const currentCount = await this.prisma.userTenant.count({
      where: { userId },
    });

    return currentCount < plan.maxTenants;
  }

  /**
   * Validate if tenant can add another team member
   */
  async validateMemberLimit(tenantId: string, planTierName: string): Promise<boolean> {
    const plan = await this.getPlanLimits(planTierName);
    if (!plan) return false;

    const currentCount = await this.prisma.tenantMember.count({
      where: { tenantId, status: 'accepted' },
    });

    return currentCount < plan.maxTeamMembers;
  }

  /**
   * Get the maximum tenant limit for a plan tier
   */
  async getMaxTenants(planTierName: string): Promise<number> {
    const plan = await this.getPlanLimits(planTierName);
    return plan?.maxTenants || 1;
  }

  /**
   * Get the maximum team members for a plan tier
   */
  async getMaxTeamMembers(planTierName: string): Promise<number> {
    const plan = await this.getPlanLimits(planTierName);
    return plan?.maxTeamMembers || 3;
  }

  /**
   * Get the maximum monthly sends for a plan tier
   */
  async getMaxMonthlySends(planTierName: string): Promise<number> {
    const plan = await this.getPlanLimits(planTierName);
    return plan?.maxMonthlySends || 10000;
  }

  /**
   * Get the maximum AI tokens per month for a plan tier
   */
  async getMaxAiTokens(planTierName: string): Promise<number> {
    const plan = await this.getPlanLimits(planTierName);
    return plan?.maxAiTokensMonthly || 1000;
  }

  /**
   * Check if a plan tier supports a specific feature
   */
  async hasCapability(planTierName: string, capability: string): Promise<boolean> {
    const plan = await this.getPlanLimits(planTierName);
    if (!plan) return false;
    return plan.capabilityFlags.includes(capability);
  }

  /**
   * Check if a plan tier supports a specific channel
   */
  async supportsChannel(planTierName: string, channel: string): Promise<boolean> {
    const plan = await this.getPlanLimits(planTierName);
    if (!plan) return false;
    return plan.availableChannels.includes(channel);
  }
}
