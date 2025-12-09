import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.e2e') });

async function globalTeardown() {
  console.log('🧹 Cleaning up E2E test environment...');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return;
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    await prisma.$connect();

    // Optional: Clean database after test suite
    // Uncomment if you want pristine state after tests
    // await prisma.$executeRawUnsafe(
    //   'TRUNCATE TABLE "tenant_members","audit_logs","user_tenants","tenant_settings","tenants","users" CASCADE;'
    // );

    await prisma.$disconnect();
    console.log('✅ Teardown complete');
  } catch (error) {
    console.error('❌ Teardown failed:', error);
    await prisma.$disconnect();
  }
}

export default globalTeardown;
