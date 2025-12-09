import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  Prisma,
  Tenant,
  TenantSetting,
  User,
  UserTenant,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import {
  AuthContext,
  AuthResult,
  AuthTenant,
  AuthTokens,
  AuthUser,
} from './auth.types';
import { PlanTier, planTierFromValue } from '../common/enums/plan-tier.enum';
import { tenantLimitForPlan } from '../common/utils/tenant-plan.util';
import { generateSessionId } from './auth.util';

@Injectable()
export class AuthService {
  private readonly loginAttempts = new Map<
    string,
    { count: number; firstAttempt: number }
  >();
  private readonly loginLimit = 5;
  private readonly loginTtlMs = 60000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(dto: SignupDto, ipAddress?: string): Promise<AuthResult> {
    const email = dto.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new HttpException(
        { code: 'AUTH_EMAIL_EXISTS', message: 'Email already in use' },
        HttpStatus.CONFLICT,
      );
    }

    const planTier = dto.planTier ?? PlanTier.Starter;
    const region = dto.region?.trim() || 'global';
    const capabilityFlags = dto.capabilityFlags ?? [];
    const tenantName =
      dto.tenantName?.trim() || this.tenantNameFromEmail(email);

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const { user, tenant } = await this.prisma.$transaction(async (prisma) => {
      const createdUser = await prisma.user.create({
        data: {
          email,

          passwordHash,
          planTier,
        },
      });

      const tenantPayload = await prisma.tenant.create({
        data: {
          name: tenantName,
          settings: {
            create: {
              planTier,
              region,
              capabilityFlags,
            },
          },
        },
        include: { settings: true },
      });

      await prisma.userTenant.create({
        data: {
          userId: createdUser.id,
          tenantId: tenantPayload.id,
          role: 'owner',
          lastActiveAt: new Date(),
        },
      });

      await prisma.user.update({
        where: { id: createdUser.id },
        data: { lastUsedTenantId: tenantPayload.id },
      });

      return {
        user: { ...createdUser, lastUsedTenantId: tenantPayload.id },
        tenant: tenantPayload,
      };
    });

    await this.createAuditLog('auth.signup', user.id, tenant.id, ipAddress, {
      planTier,
      region,
      capabilityFlags,
    });

    const tokens = await this.issueTokens({
      userId: user.id,
      email,
      tenantId: tenant.id,
      planTier: planTier,
      tenantRegion: tenant.settings?.region,
      capabilityFlags: tenant.settings?.capabilityFlags ?? [],
    });

    return {
      user: this.toAuthUser(user),
      tenant: this.toAuthTenant(tenant),
      tokens,
    };
  }

  async login(dto: LoginDto, ipAddress?: string): Promise<AuthResult> {
    const email = dto.email.toLowerCase();
    const rateLimitKey = `${email}-${ipAddress || 'unknown'}`;
    this.enforceLoginRateLimit(rateLimitKey);

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { userTenants: true },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      await this.createAuditLog(
        'auth.login.failed',
        user?.id,
        user?.lastUsedTenantId ?? undefined,
        ipAddress,
      );
      throw new HttpException(
        {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    this.loginAttempts.delete(rateLimitKey);

    const tenantId = await this.resolveTenantId(user);
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { settings: true },
    });
    if (!tenant) {
      throw new HttpException(
        { code: 'AUTH_TENANT_NOT_FOUND', message: 'Tenant not found for user' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.createAuditLog(
      'auth.login.success',
      user.id,
      tenantId,
      ipAddress,
    );
    const tokens = await this.issueTokens({
      userId: user.id,
      email,
      tenantId,
      planTier: planTierFromValue(user.planTier),
      tenantRegion: tenant.settings?.region,
      capabilityFlags: tenant.settings?.capabilityFlags ?? [],
    });

    return {
      user: this.toAuthUser({ ...user, lastUsedTenantId: tenantId }),
      tenant: this.toAuthTenant(tenant),
      tokens,
    };
  }

  async switchTenant(
    authContext: AuthContext,
    tenantId: string,
  ): Promise<AuthResult> {
    const membership = await this.prisma.userTenant.findFirst({
      where: { userId: authContext.userId, tenantId },
    });

    if (!membership) {
      throw new HttpException(
        {
          code: 'AUTH_TENANT_REQUIRED',
          message: 'Tenant not assigned to user',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { settings: true },
    });
    if (!tenant) {
      throw new HttpException(
        { code: 'AUTH_TENANT_NOT_FOUND', message: 'Tenant not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    const user = await this.prisma.user.update({
      where: { id: authContext.userId },
      data: { lastUsedTenantId: tenantId },
    });

    await this.createAuditLog('auth.tenant.switch', user.id, tenantId);
    const tokens = await this.issueTokens({
      userId: user.id,
      email: authContext.email,
      tenantId,
      planTier: planTierFromValue(user.planTier),
      tenantRegion: tenant.settings?.region,
      capabilityFlags: tenant.settings?.capabilityFlags ?? [],
    });

    return {
      user: this.toAuthUser({ ...user, lastUsedTenantId: tenantId }),
      tenant: this.toAuthTenant(tenant),
      tokens,
    };
  }

  private async issueTokens(params: {
    userId: string;
    email: string;
    tenantId: string;
    planTier: PlanTier;
    tenantRegion?: string;
    capabilityFlags: string[];
  }): Promise<AuthTokens> {
    const { userId, email, tenantId, planTier, tenantRegion, capabilityFlags } =
      params;
    const sessionId = generateSessionId();
    const planQuota = tenantLimitForPlan(planTier, this.configService);
    const payload = {
      sub: userId,
      tenantId,
      email,
      activeTenantId: tenantId,
      planTier,
      tenantRegion: tenantRegion ?? null,
      capabilityFlags,
      planQuota,
      sid: sessionId,
    };
    const accessTtlSeconds =
      Number(this.configService.get<string>('ACCESS_TOKEN_TTL')) || 900;
    const refreshTtlSeconds =
      Number(this.configService.get<string>('REFRESH_TOKEN_TTL')) || 604800;
    const accessToken = await this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>('JWT_SECRET') || 'dev-secret-access',
      expiresIn: accessTtlSeconds,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'dev-secret-refresh',
      expiresIn: refreshTtlSeconds,
    });

    return { accessToken, refreshToken };
  }

  private async resolveTenantId(
    user: User & { userTenants: UserTenant[] },
  ): Promise<string> {
    const existing = user.lastUsedTenantId || user.userTenants[0]?.tenantId;
    if (!existing) {
      throw new HttpException(
        { code: 'AUTH_TENANT_REQUIRED', message: 'No tenant assigned to user' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user.lastUsedTenantId) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastUsedTenantId: existing },
      });
    }

    return existing;
  }

  private enforceLoginRateLimit(key: string) {
    const now = Date.now();
    const entry = this.loginAttempts.get(key);

    if (entry && now - entry.firstAttempt < this.loginTtlMs) {
      if (entry.count >= this.loginLimit) {
        throw new HttpException(
          {
            code: 'AUTH_RATE_LIMITED',
            message: 'Too many login attempts. Please wait before retrying.',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      this.loginAttempts.set(key, { ...entry, count: entry.count + 1 });
      return;
    }

    this.loginAttempts.set(key, { count: 1, firstAttempt: now });
  }

  private async createAuditLog(
    action: string,
    userId?: string,
    tenantId?: string,
    ipAddress?: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    await this.prisma.auditLog.create({
      data: {
        action,
        userId,
        tenantId,
        ipAddress,
        metadata,
      },
    });
  }

  private tenantNameFromEmail(email: string): string {
    const localPart = email.split('@')[0];
    return `${localPart}-workspace`;
  }

  private toAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      lastUsedTenantId: user.lastUsedTenantId as string,
      planTier: planTierFromValue(user.planTier),
    };
  }

  private toAuthTenant(
    tenant: Tenant & { settings?: TenantSetting | null },
  ): AuthTenant {
    return {
      id: tenant.id,
      name: tenant.name,
      settings: tenant.settings
        ? {
            planTier: planTierFromValue(tenant.settings.planTier),
            region: tenant.settings.region,
            capabilityFlags: tenant.settings.capabilityFlags,
          }
        : null,
    };
  }
}
