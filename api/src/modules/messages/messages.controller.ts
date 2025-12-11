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
import { QuotaExceededException } from '../../common/exceptions/quota-exceeded.exception';
import { TenantsService } from '../tenants/tenants.service';
import { MessagesService, type MessageResponse } from './messages.service';
import { SendWhatsAppDto, SendEmailDto } from './dto';

@Controller('tenants/:tenantId/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly quotaService: QuotaService,
    private readonly tenantsService: TenantsService,
  ) {}

  @Post('whatsapp/send')
  @RequireFeature('whatsapp')
  @HttpCode(HttpStatus.CREATED)
  async sendWhatsApp(
    @Param('tenantId') tenantId: string,
    @Body() dto: SendWhatsAppDto,
    @CurrentUser() user: AuthContext,
  ): Promise<MessageResponse> {
    // Verify membership
    await this.tenantsService.ensureMembership(user.userId, tenantId);

    // Check quota before sending
    const quotaCheck = await this.quotaService.checkQuota(
      tenantId,
      UsageType.MonthlySends,
      dto.recipients.length,
    );

    if (!quotaCheck.allowed) {
      throw new QuotaExceededException(
        quotaCheck.current,
        quotaCheck.limit,
        'monthly_sends',
      );
    }

    // Send the message
    const result = await this.messagesService.sendWhatsApp(dto);

    // Increment usage after successful send
    await this.quotaService.incrementUsage(
      tenantId,
      UsageType.MonthlySends,
      dto.recipients.length,
    );

    return result;
  }

  @Post('email/send')
  @RequireFeature('email')
  @HttpCode(HttpStatus.CREATED)
  async sendEmail(
    @Param('tenantId') tenantId: string,
    @Body() dto: SendEmailDto,
    @CurrentUser() user: AuthContext,
  ): Promise<MessageResponse> {
    // Verify membership
    await this.tenantsService.ensureMembership(user.userId, tenantId);

    // Check quota before sending
    const quotaCheck = await this.quotaService.checkQuota(
      tenantId,
      UsageType.MonthlySends,
      dto.recipients.length,
    );

    if (!quotaCheck.allowed) {
      throw new QuotaExceededException(
        quotaCheck.current,
        quotaCheck.limit,
        'monthly_sends',
      );
    }

    // Send the message
    const result = await this.messagesService.sendEmail(dto);

    // Increment usage after successful send
    await this.quotaService.incrementUsage(
      tenantId,
      UsageType.MonthlySends,
      dto.recipients.length,
    );

    return result;
  }
}
