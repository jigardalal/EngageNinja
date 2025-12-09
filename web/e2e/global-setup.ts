import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.e2e') });

async function globalSetup() {
  console.log('🧹 Setting up E2E test environment...');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL must be set for E2E tests');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    await prisma.$connect();
    console.log('✅ Connected to test database');

    // Clean database before test suite
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "tenant_members","audit_logs","user_tenants","tenant_settings","tenants","users" CASCADE;'
    );
    console.log('✅ Database cleaned');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    await prisma.$disconnect();
    throw error;
  }
}

export default globalSetup;
