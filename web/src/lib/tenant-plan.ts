export const planTierOptions = ['free', 'starter', 'growth', 'agency', 'enterprise'] as const;
export type PlanTier = (typeof planTierOptions)[number];

export const planLabels: Record<PlanTier, string> = {
  free: 'Free',
  starter: 'Starter',
  growth: 'Growth',
  agency: 'Agency',
  enterprise: 'Enterprise',
};

export interface PlanLimits {
  maxTenants: number;
  maxTeamMembers: number;
  maxMonthlySends: number;
  maxAiTokens: number;
  availableChannels: string[];
}

export const planLimits: Record<PlanTier, PlanLimits> = {
  free: {
    maxTenants: 1,
    maxTeamMembers: 1,
    maxMonthlySends: 1000,
    maxAiTokens: 0,
    availableChannels: ['WhatsApp'],
  },
  starter: {
    maxTenants: 1,
    maxTeamMembers: 3,
    maxMonthlySends: 10000,
    maxAiTokens: 1000,
    availableChannels: ['WhatsApp'],
  },
  growth: {
    maxTenants: 1,
    maxTeamMembers: 10,
    maxMonthlySends: 100000,
    maxAiTokens: 5000,
    availableChannels: ['WhatsApp', 'Email'],
  },
  agency: {
    maxTenants: 50,
    maxTeamMembers: 100,
    maxMonthlySends: 500000,
    maxAiTokens: 50000,
    availableChannels: ['WhatsApp', 'Email'],
  },
  enterprise: {
    maxTenants: 1000,
    maxTeamMembers: 500,
    maxMonthlySends: 5000000,
    maxAiTokens: 500000,
    availableChannels: ['WhatsApp', 'Email'],
  },
};

export function tenantLimitForPlan(planTier: PlanTier): number {
  return planLimits[planTier].maxTenants;
}

export function memberLimitForPlan(planTier: PlanTier): number {
  return planLimits[planTier].maxTeamMembers;
}

export const planGuidance: Record<PlanTier, string> = {
  free: 'Perfect for testing and small personal projects.',
  starter: 'Starter plans include one tenant with essential access and basic AI.',
  growth: 'Growth accounts with email support, AI campaigns, and automation.',
  agency: 'Agency plans for teams managing multiple client workspaces.',
  enterprise: 'Enterprise-grade with SSO, custom residency, and dedicated support.',
};
