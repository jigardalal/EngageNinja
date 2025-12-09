import { ConfigService } from '@nestjs/config';

import { PlanTier } from '../enums/plan-tier.enum';

export function tenantLimitForPlan(
  planTier: PlanTier,
  configService: ConfigService,
): number {
  const starter =
    Number(configService.get<string>('STARTER_TENANT_LIMIT')) || 1;
  const growth = Number(configService.get<string>('GROWTH_TENANT_POOL')) || 5;
  const agency = Number(configService.get<string>('AGENCY_TENANT_POOL')) || 25;

  switch (planTier) {
    case PlanTier.Growth:
      return Math.max(1, growth);
    case PlanTier.Agency:
      return Math.max(1, agency);
    default:
      return Math.max(1, starter);
  }
}
