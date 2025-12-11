import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../../prisma/prisma.service';
import { PlanTierService } from '../../../common/services/plan-tier.service';
import { CreateApiKeyDto } from './dto';

@Injectable()
export class TenantApiKeysService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly planTierService: PlanTierService,
  ) {}

  async createApiKey(userId: string, tenantId: string, dto: CreateApiKeyDto) {
    // Verify user has owner/admin role in tenant
    const membership = await this.prisma.userTenant.findFirst({
      where: { userId, tenantId },
    });

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new HttpException(
        {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Only owners and admins can manage API keys',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Verify tenant exists and get plan tier
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { settings: true },
    });

    if (!tenant || !tenant.settings) {
      throw new HttpException(
        { code: 'TENANT_NOT_FOUND', message: 'Tenant not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    const planTier = tenant.settings.planTier;

    // Check plan tier entitlement for API keys (FR3: Starter exception, Growth/Agency allowed)
    const allowsApiKeys = await this.planTierService.hasCapability(
      planTier,
      'api',
    );
    if (!allowsApiKeys) {
      throw new HttpException(
        {
          code: 'API_KEYS_NOT_ALLOWED',
          message: `Plan tier "${planTier}" does not support API keys. Upgrade to Growth or Agency tier.`,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Generate strong secret (256 bits / 32 bytes)
    const plainSecret = randomBytes(32).toString('hex');
    const hashedSecret = await bcrypt.hash(plainSecret, 10);

    // Create API key
    const apiKey = await this.prisma.tenantApiKey.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        hashedSecret,
        planTier,
        scopeFlags: dto.scopeFlags || [],
        createdBy: userId,
      },
    });

    // Emit audit log with target_id
    await this.createAuditLog('api_key.create', userId, tenantId, apiKey.id, {
      apiKeyId: apiKey.id,
      apiKeyName: apiKey.name,
    });

    // Return secret only once (copy-once pattern)
    return {
      id: apiKey.id,
      secret: plainSecret, // Show once, never again
      name: apiKey.name,
      createdAt: apiKey.createdAt,
      status: 'active',
    };
  }

  async listApiKeys(userId: string, tenantId: string) {
    // Verify user membership
    await this.ensureMembership(userId, tenantId);

    const keys = await this.prisma.tenantApiKey.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        description: true,
        planTier: true,
        revokedAt: true,
        lastUsedAt: true,
        lastRotatedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return keys.map((key) => ({
      ...key,
      status: key.revokedAt ? 'revoked' : 'active',
      lastUsed: key.lastUsedAt
        ? Math.floor(
            (Date.now() - key.lastUsedAt.getTime()) / (1000 * 60 * 60 * 24),
          )
        : null,
    }));
  }

  async revokeApiKey(userId: string, tenantId: string, keyId: string) {
    // Verify user has owner/admin role
    const membership = await this.prisma.userTenant.findFirst({
      where: { userId, tenantId },
    });

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new HttpException(
        {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Only owners and admins can revoke API keys',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Verify key belongs to tenant
    const key = await this.prisma.tenantApiKey.findFirst({
      where: { id: keyId, tenantId },
    });

    if (!key) {
      throw new HttpException(
        { code: 'API_KEY_NOT_FOUND', message: 'API key not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    if (key.revokedAt) {
      throw new HttpException(
        { code: 'API_KEY_ALREADY_REVOKED', message: 'API key is already revoked' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Revoke key
    await this.prisma.tenantApiKey.update({
      where: { id: keyId },
      data: {
        revokedAt: new Date(),
        revokedBy: userId,
      },
    });

    // Emit audit log with target_id
    await this.createAuditLog('api_key.revoke', userId, tenantId, keyId, {
      apiKeyId: keyId,
    });

    return { status: 'revoked', message: 'API key revoked successfully' };
  }

  async verifyApiKey(secret: string, tenantId: string) {
    // Find active key for tenant
    const keys = await this.prisma.tenantApiKey.findMany({
      where: {
        tenantId,
        revokedAt: null,
      },
    });

    if (!keys.length) {
      return null;
    }

    // Compare secret against hashed versions
    for (const key of keys) {
      const isMatch = await bcrypt.compare(secret, key.hashedSecret);
      if (isMatch) {
        // Update lastUsedAt
        await this.prisma.tenantApiKey.update({
          where: { id: key.id },
          data: { lastUsedAt: new Date() },
        });

        // Emit audit log for usage event
        await this.createAuditLog('api_key.use', key.createdBy, tenantId, key.id, {
          apiKeyId: key.id,
          apiKeyName: key.name,
        });

        return {
          id: key.id,
          tenantId: key.tenantId,
          scopeFlags: key.scopeFlags,
          planTier: key.planTier,
          name: key.name,
        };
      }
    }

    return null;
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
    targetId?: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    await this.prisma.auditLog.create({
      data: {
        action,
        userId,
        tenantId,
        targetId: targetId ?? undefined,
        metadata: metadata ?? undefined,
      },
    });
  }
}
