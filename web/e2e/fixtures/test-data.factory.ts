import { getPrismaClient, hashPassword } from '../utils/db.util';

export interface TestUser {
  id: string;
  email: string;
  password: string; // Plain text for test login
  passwordHash: string;
  planTier: 'starter' | 'growth' | 'agency';
}

export interface TestTenant {
  id: string;
  name: string;
  settings?: {
    planTier: string;
    region: string;
    capabilityFlags: string[];
  };
}

export interface TestUserWithTenant {
  user: TestUser;
  tenant: TestTenant;
  role: string;
}

const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Test123!Aa';

export class TestDataFactory {
  private prisma = getPrismaClient();
  private userCounter = 0;
  private tenantCounter = 0;

  async createUser(overrides?: Partial<TestUser>): Promise<TestUser> {
    this.userCounter++;
    const email = overrides?.email || `test-user-${this.userCounter}-${Date.now()}@example.com`;
    const password = overrides?.password || TEST_PASSWORD;
    const passwordHash = await hashPassword(password);
    const planTier = overrides?.planTier || 'starter';

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        planTier,
      },
    });

    return {
      id: user.id,
      email: user.email,
      password,
      passwordHash,
      planTier: planTier as any,
    };
  }

  async createTenant(overrides?: Partial<TestTenant>): Promise<TestTenant> {
    this.tenantCounter++;
    const name = overrides?.name || `Test Tenant ${this.tenantCounter}`;

    const tenant = await this.prisma.tenant.create({
      data: {
        name,
        settings: {
          create: {
            planTier: overrides?.settings?.planTier || 'starter',
            region: overrides?.settings?.region || 'us-east-1',
            capabilityFlags: overrides?.settings?.capabilityFlags || ['core'],
          },
        },
      },
      include: { settings: true },
    });

    return {
      id: tenant.id,
      name: tenant.name,
      settings: tenant.settings
        ? {
            planTier: tenant.settings.planTier,
            region: tenant.settings.region,
            capabilityFlags: tenant.settings.capabilityFlags,
          }
        : undefined,
    };
  }

  async createUserWithTenant(
    role: 'owner' | 'admin' | 'viewer' = 'owner',
    userOverrides?: Partial<TestUser>,
    tenantOverrides?: Partial<TestTenant>
  ): Promise<TestUserWithTenant> {
    const user = await this.createUser(userOverrides);
    const tenant = await this.createTenant(tenantOverrides);

    await this.prisma.userTenant.create({
      data: {
        userId: user.id,
        tenantId: tenant.id,
        role,
        lastActiveAt: new Date(),
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastUsedTenantId: tenant.id },
    });

    return { user, tenant, role };
  }

  async createUserWithMultipleTenants(
    tenantCount: number = 2,
    userOverrides?: Partial<TestUser>
  ): Promise<{ user: TestUser; tenants: TestTenant[] }> {
    const user = await this.createUser(userOverrides);
    const tenants: TestTenant[] = [];

    for (let i = 0; i < tenantCount; i++) {
      const tenant = await this.createTenant({
        name: `Tenant ${i + 1} for ${user.email}`,
      });
      tenants.push(tenant);

      await this.prisma.userTenant.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          role: 'owner',
          lastActiveAt: new Date(),
        },
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastUsedTenantId: tenants[0].id },
    });

    return { user, tenants };
  }

  async createTenantForUser(
    userId: string,
    role: 'owner' | 'admin' | 'viewer' = 'owner',
    overrides?: Partial<TestTenant>
  ): Promise<TestTenant> {
    const tenant = await this.createTenant(overrides);

    await this.prisma.userTenant.create({
      data: {
        userId,
        tenantId: tenant.id,
        role,
        lastActiveAt: new Date(),
      },
    });

    return tenant;
  }
}
