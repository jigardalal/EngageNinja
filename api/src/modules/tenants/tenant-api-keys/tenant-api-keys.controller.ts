import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import type { AuthContext } from '../../../auth/auth.types';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ActiveTenantGuard } from '../../../auth/guards/active-tenant.guard';
import { TenantApiKeysService } from './tenant-api-keys.service';
import { CreateApiKeyDto } from './dto';

@Controller('tenants/:tenantId/api-keys')
@UseGuards(JwtAuthGuard, ActiveTenantGuard)
export class TenantApiKeysController {
  constructor(private readonly tenantApiKeysService: TenantApiKeysService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateApiKeyDto,
    @CurrentUser() user: AuthContext,
  ) {
    return this.tenantApiKeysService.createApiKey(user.userId, tenantId, dto);
  }

  @Get()
  async list(
    @Param('tenantId') tenantId: string,
    @CurrentUser() user: AuthContext,
  ) {
    return this.tenantApiKeysService.listApiKeys(user.userId, tenantId);
  }

  @Delete(':keyId')
  @HttpCode(HttpStatus.OK)
  async revoke(
    @Param('tenantId') tenantId: string,
    @Param('keyId') keyId: string,
    @CurrentUser() user: AuthContext,
  ) {
    return this.tenantApiKeysService.revokeApiKey(user.userId, tenantId, keyId);
  }
}
