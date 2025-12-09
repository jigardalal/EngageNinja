export const planTierOptions = ['starter', 'growth', 'agency'] as const;
export type PlanTier = (typeof planTierOptions)[number];

export const planLabels: Record<PlanTier, string> = {
  starter: 'Starter',
  growth: 'Growth',
  agency: 'Agency',
};

export function tenantLimitForPlan(planTier: PlanTier): number {
  switch (planTier) {
    case 'growth':
      return 5;
    case 'agency':
      return 25;
    default:
      return 1;
  }
}

export const planGuidance: Record<PlanTier, string> = {
  starter: 'Starter plans include one tenant with essential access.',
  growth: 'Growth accounts enable a configurable tenant pool for scaling teams.',
  agency: 'Agency plans keep multi-tenant workspaces aligned with marketing ops.',
};
