import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AuthContext } from '../../auth/auth.types';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequireFeature } from '../../common/decorators/require-feature.decorator';
import { QuotaService, UsageType } from '../../common/services/quota.service';
import { TenantsService } from '../tenants/tenants.service';
import { CampaignsService, type CampaignResponse } from './campaigns.service';
import { SendCampaignDto } from './dto';

@Controller('tenants/:tenantId/campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly quotaService: QuotaService,
    private readonly tenantsService: TenantsService,
  ) {}

  @Post('send')
  @RequireFeature('campaigns')
  @HttpCode(HttpStatus.CREATED)
  async sendCampaign(
    @Param('tenantId') tenantId: string,
    @Body() dto: SendCampaignDto,
    @CurrentUser() user: AuthContext,
  ): Promise<CampaignResponse> {
    // Verify membership
    await this.tenantsService.ensureMembership(user.userId, tenantId);

    // Estimate recipient count for quota check
    const estimatedRecipients =
      await this.campaignsService.estimateRecipients(dto.recipientSegments);

    // Check quota before sending
    const quotaCheck = await this.quotaService.checkQuota(
      tenantId,
      UsageType.MonthlySends,
      estimatedRecipients,
    );

    if (!quotaCheck.allowed) {
      throw new Error(
        `Quota exceeded: ${quotaCheck.current}/${quotaCheck.limit} monthly sends used`,
      );
    }

    // Send the campaign
    const result = await this.campaignsService.sendCampaign(dto);

    // Increment usage after successful send
    // Use actual recipient count from campaign result if available
    await this.quotaService.incrementUsage(
      tenantId,
      UsageType.MonthlySends,
      result.recipientCount,
    );

    return result;
  }
}
