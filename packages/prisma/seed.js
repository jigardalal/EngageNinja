const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required for the Prisma seed script.');
}
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

const PASSWORD_HASH =
  '$2b$12$nnus6ZYN1V5pvRWpVazkGes0Xsw75wyEVHLJrd5EO1CXIQ2cHXLQu'; // `Test123!Aa`

async function main() {
  await prisma.$transaction([
    prisma.usageCounter.deleteMany(),
    prisma.tenantMember.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.userTenant.deleteMany(),
    prisma.tenantSetting.deleteMany(),
    prisma.tenant.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Create 5 users - one for each plan tier
  const user1 = await prisma.user.create({
    data: {
      email: 'user-free@example.com',
      passwordHash: PASSWORD_HASH,
      planTier: 'free',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      passwordHash: PASSWORD_HASH,
      planTier: 'starter',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      passwordHash: PASSWORD_HASH,
      planTier: 'growth',
    },
  });

  const user4 = await prisma.user.create({
    data: {
      email: 'user3@example.com',
      passwordHash: PASSWORD_HASH,
      planTier: 'growth',
    },
  });

  const user5 = await prisma.user.create({
    data: {
      email: 'user-enterprise@example.com',
      passwordHash: PASSWORD_HASH,
      planTier: 'enterprise',
    },
  });

  // Create 5 tenants - one per plan tier
  const tenant1 = await prisma.tenant.create({
    data: {
      name: 'Free Tier Workspace',
      settings: {
        create: {
          planTier: 'free',
          region: 'us-east-1',
          capabilityFlags: ['core'],
        },
      },
    },
    include: { settings: true },
  });

  const tenant2 = await prisma.tenant.create({
    data: {
      name: 'Starter Workspace',
      settings: {
        create: {
          planTier: 'starter',
          region: 'us-east-1',
          capabilityFlags: ['core', 'ai_basic'],
        },
      },
    },
    include: { settings: true },
  });

  const tenant3 = await prisma.tenant.create({
    data: {
      name: 'Growth Workspace',
      settings: {
        create: {
          planTier: 'growth',
          region: 'eu-central-1',
          capabilityFlags: ['core', 'ai_campaign_gen', 'api'],
        },
      },
    },
    include: { settings: true },
  });

  const tenant4 = await prisma.tenant.create({
    data: {
      name: 'Agency Workspace',
      settings: {
        create: {
          planTier: 'agency',
          region: 'us-west-2',
          capabilityFlags: ['core', 'multi_tenant', 'api', 'crm_adapters'],
        },
      },
    },
    include: { settings: true },
  });

  const tenant5 = await prisma.tenant.create({
    data: {
      name: 'Enterprise Workspace',
      settings: {
        create: {
          planTier: 'enterprise',
          region: 'us-east-1',
          capabilityFlags: ['core', 'multi_tenant', 'api', 'sso', 'custom_residency'],
        },
      },
    },
    include: { settings: true },
  });

  // User assignments - each user owns one tenant
  await prisma.userTenant.createMany({
    data: [
      { userId: user1.id, tenantId: tenant1.id, role: 'owner', lastActiveAt: new Date() },
      { userId: user2.id, tenantId: tenant2.id, role: 'owner', lastActiveAt: new Date() },
      { userId: user3.id, tenantId: tenant3.id, role: 'owner', lastActiveAt: new Date() },
      { userId: user4.id, tenantId: tenant3.id, role: 'member', lastActiveAt: new Date() },
      { userId: user4.id, tenantId: tenant4.id, role: 'member', lastActiveAt: new Date() },
      { userId: user5.id, tenantId: tenant5.id, role: 'owner', lastActiveAt: new Date() },
    ],
  });

  // Set last used tenant for each user
  await prisma.user.update({ where: { id: user1.id }, data: { lastUsedTenantId: tenant1.id } });
  await prisma.user.update({ where: { id: user2.id }, data: { lastUsedTenantId: tenant2.id } });
  await prisma.user.update({ where: { id: user3.id }, data: { lastUsedTenantId: tenant3.id } });
  await prisma.user.update({ where: { id: user4.id }, data: { lastUsedTenantId: tenant3.id } });
  await prisma.user.update({ where: { id: user5.id }, data: { lastUsedTenantId: tenant5.id } });

  // Create initial usage counters for each tenant
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const tenants = [tenant1, tenant2, tenant3, tenant4, tenant5];
  await Promise.all(
    tenants.flatMap((tenant) => [
      prisma.usageCounter.create({
        data: {
          tenantId: tenant.id,
          usageType: 'monthly_sends',
          periodStart: currentMonth,
          periodEnd: nextMonth,
          count: 0,
        },
      }),
      prisma.usageCounter.create({
        data: {
          tenantId: tenant.id,
          usageType: 'ai_tokens',
          periodStart: currentMonth,
          periodEnd: nextMonth,
          count: 0,
        },
      }),
    ]),
  );

  console.info(
    '🌱 Seed complete:',
    { plan: 'Free', user: 'user-free@example.com', tenant: tenant1.name },
    { plan: 'Starter', user: 'user1@example.com', tenant: tenant2.name },
    { plan: 'Growth', user: 'user2@example.com', tenant: tenant3.name },
    { plan: 'Growth (multi)', user: 'user3@example.com', tenants: `${tenant3.name} & ${tenant4.name}` },
    { plan: 'Enterprise', user: 'user-enterprise@example.com', tenant: tenant5.name },
  );
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
