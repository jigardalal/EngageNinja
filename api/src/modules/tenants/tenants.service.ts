import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Tenant, TenantSetting } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { planTierFromValue, PlanTier } from '../../common/enums/plan-tier.enum';
import { tenantLimitForPlan } from '../../common/utils/tenant-plan.util';

export interface TenantWithSettings extends Tenant {
  settings?: TenantSetting | null;
}

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createTenant(userId: string, dto: CreateTenantDto, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new HttpException(
        {
          code: 'TENANT_USER_NOT_FOUND',
          message: 'Authenticated user not found',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const currentCount = await this.prisma.userTenant.count({
      where: { userId },
    });
    const allowed = this.getTenantLimit(planTierFromValue(user.planTier));
    if (currentCount >= allowed) {
      throw new HttpException(
        {
          code: 'TENANT_LIMIT_REACHED',
          message: `Plan tier ${user.planTier} allows only ${allowed} tenant${allowed === 1 ? '' : 's'}`,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const capabilityFlags = dto.capabilityFlags ?? [];

    const tenant = await this.prisma.$transaction(async (prisma) => {
      const createdTenant = await prisma.tenant.create({
        data: { name: dto.name },
      });

      await prisma.userTenant.create({
        data: {
          userId,
          tenantId: createdTenant.id,
          role: 'owner',
          lastActiveAt: new Date(),
        },
      });

      await prisma.tenantSetting.create({
        data: {
          tenantId: createdTenant.id,
          planTier: dto.planTier,
          region: dto.region,
          capabilityFlags,
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { lastUsedTenantId: createdTenant.id },
      });

      return createdTenant;
    });

    await this.createAuditLog('tenant.create', userId, tenant.id, ipAddress, {
      planTier: dto.planTier,
      region: dto.region,
      capabilityFlags,
    });

    return this.loadTenantWithSettings(tenant.id);
  }

  async listTenants(userId: string) {
    const memberships = await this.prisma.userTenant.findMany({
      where: { userId },
      include: {
        tenant: { include: { settings: true } },
      },
      orderBy: { lastActiveAt: 'desc' },
    });

    return memberships.map(({ tenant, role }) => ({
      id: tenant.id,
      name: tenant.name,
      role,
      settings: tenant.settings,
    }));
  }

  async getTenant(userId: string, tenantId: string) {
    await this.ensureMembership(userId, tenantId);
    return this.loadTenantWithSettings(tenantId);
  }

  async deleteTenant(userId: string, tenantId: string, ipAddress?: string) {
    const membership = await this.prisma.userTenant.findFirst({
      where: { userId, tenantId },
    });
    if (!membership) {
      throw new HttpException(
        {
          code: 'TENANT_MEMBERSHIP_REQUIRED',
          message: 'User is not a member of the tenant',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (membership.role !== 'owner') {
      throw new HttpException(
        {
          code: 'TENANT_DELETE_FORBIDDEN',
          message: 'Only owners can delete tenants',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    await this.prisma.$transaction(async (prisma) => {
      await prisma.userTenant.deleteMany({ where: { tenantId } });
      await prisma.tenantSetting.deleteMany({ where: { tenantId } });
      await prisma.user.updateMany({
        where: { lastUsedTenantId: tenantId },
        data: { lastUsedTenantId: null },
      });
      await prisma.tenant.delete({ where: { id: tenantId } });
    });

    await this.createAuditLog('tenant.delete', userId, tenantId, ipAddress, {
      deletedBy: userId,
    });
  }

  private getTenantLimit(planTier: PlanTier) {
    return tenantLimitForPlan(planTier, this.configService);
  }

  private async loadTenantWithSettings(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { settings: true },
    });

    if (!tenant) {
      throw new HttpException(
        { code: 'TENANT_NOT_FOUND', message: 'Tenant not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    return tenant as TenantWithSettings;
  }

  private async ensureMembership(userId: string, tenantId: string) {
    const membership = await this.prisma.userTenant.findFirst({
      where: { userId, tenantId },
    });
    if (!membership) {
      throw new HttpException(
        {
          code: 'TENANT_MEMBERSHIP_REQUIRED',
          message: 'Not a member of the tenant',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  private async createAuditLog(
    action: string,
    userId: string,
    tenantId: string,
    ipAddress?: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    await this.prisma.auditLog.create({
      data: {
        action,
        userId,
        tenantId,
        ipAddress,
        metadata: metadata ?? undefined,
      },
    });
  }
}
