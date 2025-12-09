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
  Put,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AuthContext } from '../../auth/auth.types';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantsService } from './tenants.service';
import { CreateTenantDto, InviteTenantMemberDto, UpdateMemberRoleDto } from './dto';
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

  @Post(':tenantId/members/invite')
  @HttpCode(HttpStatus.CREATED)
  async inviteMember(
    @Param('tenantId') tenantId: string,
    @Body() dto: InviteTenantMemberDto,
    @CurrentUser() user: AuthContext,
    @Ip() ip?: string,
  ) {
    return this.tenantsService.inviteMember(user.userId, tenantId, dto, ip);
  }

  @Get(':tenantId/members')
  async listMembers(
    @Param('tenantId') tenantId: string,
    @CurrentUser() user: AuthContext,
  ) {
    return this.tenantsService.listMembers(user.userId, tenantId);
  }

  @Put(':tenantId/members/:memberId/role')
  async updateMemberRole(
    @Param('tenantId') tenantId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto,
    @CurrentUser() user: AuthContext,
    @Ip() ip?: string,
  ) {
    return this.tenantsService.updateMemberRole(
      user.userId,
      tenantId,
      memberId,
      dto,
      ip,
    );
  }

  @Delete(':tenantId/members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeMember(
    @Param('tenantId') tenantId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: AuthContext,
    @Ip() ip?: string,
  ) {
    await this.tenantsService.revokeMember(user.userId, tenantId, memberId, ip);
  }
}
