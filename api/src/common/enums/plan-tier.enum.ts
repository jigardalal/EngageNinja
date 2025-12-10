export enum PlanTier {
  Free = 'free',
  Starter = 'starter',
  Growth = 'growth',
  Agency = 'agency',
  Enterprise = 'enterprise',
}

export function planTierFromValue(value?: string | null): PlanTier {
  const allowed = Object.values(PlanTier);
  if (value && allowed.includes(value as PlanTier)) {
    return value as PlanTier;
  }
  return PlanTier.Starter;
}
