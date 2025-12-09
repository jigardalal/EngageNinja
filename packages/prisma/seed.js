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
    prisma.tenantMember.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.userTenant.deleteMany(),
    prisma.tenantSetting.deleteMany(),
    prisma.tenant.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const ownerUser = await prisma.user.create({
    data: {
      email: 'owner@example.com',
      passwordHash: PASSWORD_HASH,
      planTier: 'growth',
    },
  });

  const memberUser = await prisma.user.create({
    data: {
      email: 'member@example.com',
      passwordHash: PASSWORD_HASH,
      planTier: 'starter',
    },
  });

  const tenants = await Promise.all([
    prisma.tenant.create({
      data: {
        name: 'Alpha Workspace',
        settings: {
          create: {
            planTier: 'growth',
            region: 'us-east-1',
            capabilityFlags: ['core', 'audit'],
          },
        },
      },
      include: { settings: true },
    }),
    prisma.tenant.create({
      data: {
        name: 'Beta Collective',
        settings: {
          create: {
            planTier: 'starter',
            region: 'eu-central-1',
            capabilityFlags: ['core'],
          },
        },
      },
      include: { settings: true },
    }),
  ]);

  const [alphaTenant, betaTenant] = tenants;

  await prisma.userTenant.createMany({
    data: [
      {
        userId: ownerUser.id,
        tenantId: alphaTenant.id,
        role: 'owner',
        lastActiveAt: new Date(),
      },
      {
        userId: ownerUser.id,
        tenantId: betaTenant.id,
        role: 'viewer',
        lastActiveAt: new Date(),
      },
      {
        userId: memberUser.id,
        tenantId: betaTenant.id,
        role: 'owner',
        lastActiveAt: new Date(),
      },
    ],
  });

  await prisma.user.update({
    where: { id: ownerUser.id },
    data: { lastUsedTenantId: alphaTenant.id },
  });

  await prisma.user.update({
    where: { id: memberUser.id },
    data: { lastUsedTenantId: betaTenant.id },
  });

  await prisma.tenantMember.createMany({
    data: [
      {
        tenantId: alphaTenant.id,
        email: 'invited-manager@alpha.example.com',
        role: 'manager',
        status: 'accepted',
        invitedBy: ownerUser.id,
        acceptedAt: new Date(),
      },
      {
        tenantId: betaTenant.id,
        email: 'invited-analyst@beta.example.com',
        role: 'analyst',
        status: 'pending',
        invitedBy: memberUser.id,
      },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        action: 'auth.signup',
        userId: ownerUser.id,
        tenantId: alphaTenant.id,
        metadata: { planTier: 'growth', region: 'us-east-1' },
      },
      {
        action: 'auth.login.success',
        userId: memberUser.id,
        tenantId: betaTenant.id,
        metadata: { planTier: 'starter' },
      },
    ],
  });

  console.info(
    'Seed complete:',
    { owner: ownerUser.email, tenant: alphaTenant.name },
    { member: memberUser.email, tenant: betaTenant.name },
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
