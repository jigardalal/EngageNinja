import { Module } from '@nestjs/common';
import { PlanTierService } from './services/plan-tier.service';
import { QuotaService } from './services/quota.service';
import { FeatureGuard } from './guards/feature.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PlanTierService, QuotaService, FeatureGuard],
  exports: [PlanTierService, QuotaService, FeatureGuard],
})
export class CommonModule {}
