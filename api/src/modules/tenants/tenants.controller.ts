import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AuthContext } from '../../auth/auth.types';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import type { TenantWithSettings } from './tenants.service';

@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTenant(
    @Body() dto: CreateTenantDto,
    @CurrentUser() user: AuthContext,
    @Ip() ip?: string,
  ): Promise<TenantWithSettings> {
    return this.tenantsService.createTenant(user.userId, dto, ip);
  }

  @Get()
  async listTenants(@CurrentUser() user: AuthContext) {
    return this.tenantsService.listTenants(user.userId);
  }

  @Get(':tenantId')
  async getTenant(
    @Param('tenantId') tenantId: string,
    @CurrentUser() user: AuthContext,
  ): Promise<TenantWithSettings> {
    return this.tenantsService.getTenant(user.userId, tenantId);
  }

  @Delete(':tenantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTenant(
    @Param('tenantId') tenantId: string,
    @CurrentUser() user: AuthContext,
    @Ip() ip?: string,
  ) {
    await this.tenantsService.deleteTenant(user.userId, tenantId, ip);
  }
}
