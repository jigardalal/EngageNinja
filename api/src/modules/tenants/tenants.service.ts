import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Tenant, TenantSetting } from '@prisma/client';
import { randomBytes } from 'crypto';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantDto, InviteTenantMemberDto, UpdateMemberRoleDto } from './dto';
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

  async inviteMember(
    userId: string,
    tenantId: string,
    dto: InviteTenantMemberDto,
    ipAddress?: string,
  ) {
    await this.ensureMembership(userId, tenantId);
    await this.ensureAdminOrOwner(userId, tenantId);

    const inviteToken = randomBytes(32).toString('hex');

    const existingMember = await this.prisma.tenantMember.findFirst({
      where: {
        tenantId,
        email: dto.email,
      },
    });

    let member;
    if (existingMember) {
      member = await this.prisma.tenantMember.update({
        where: { id: existingMember.id },
        data: {
          role: dto.role,
          inviteToken,
          status: 'pending',
          acceptedAt: null,
          updatedAt: new Date(),
        },
      });
    } else {
      member = await this.prisma.tenantMember.create({
        data: {
          tenantId,
          email: dto.email,
          role: dto.role,
          inviteToken,
          invitedBy: userId,
          status: 'pending',
        },
      });
    }

    await this.createAuditLog(
      'tenant.member.invite',
      userId,
      tenantId,
      ipAddress,
      {
        invitedEmail: dto.email,
        role: dto.role,
        memberId: member.id,
      },
    );

    return {
      id: member.id,
      email: member.email,
      role: member.role,
      status: member.status,
      createdAt: member.createdAt,
    };
  }

  async listMembers(userId: string, tenantId: string) {
    await this.ensureMembership(userId, tenantId);

    const members = await this.prisma.tenantMember.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        acceptedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return members;
  }

  async updateMemberRole(
    userId: string,
    tenantId: string,
    memberId: string,
    dto: UpdateMemberRoleDto,
    ipAddress?: string,
  ) {
    await this.ensureMembership(userId, tenantId);
    await this.ensureAdminOrOwner(userId, tenantId);

    const member = await this.prisma.tenantMember.findFirst({
      where: { id: memberId, tenantId },
    });

    if (!member) {
      throw new HttpException(
        {
          code: 'MEMBER_NOT_FOUND',
          message: 'Member not found in this tenant',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const updated = await this.prisma.tenantMember.update({
      where: { id: memberId },
      data: { role: dto.role },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    await this.createAuditLog(
      'tenant.member.role_update',
      userId,
      tenantId,
      ipAddress,
      {
        memberId,
        memberEmail: member.email,
        newRole: dto.role,
        previousRole: member.role,
      },
    );

    return updated;
  }

  async revokeMember(
    userId: string,
    tenantId: string,
    memberId: string,
    ipAddress?: string,
  ) {
    await this.ensureMembership(userId, tenantId);
    await this.ensureAdminOrOwner(userId, tenantId);

    const member = await this.prisma.tenantMember.findFirst({
      where: { id: memberId, tenantId },
    });

    if (!member) {
      throw new HttpException(
        {
          code: 'MEMBER_NOT_FOUND',
          message: 'Member not found in this tenant',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.tenantMember.delete({
      where: { id: memberId },
    });

    await this.createAuditLog(
      'tenant.member.revoke',
      userId,
      tenantId,
      ipAddress,
      {
        revokedMemberId: memberId,
        revokedEmail: member.email,
      },
    );

    return { success: true };
  }

  private async ensureAdminOrOwner(userId: string, tenantId: string) {
    const membership = await this.prisma.userTenant.findFirst({
      where: { userId, tenantId },
    });

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new HttpException(
        {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Only owners and admins can manage members',
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
