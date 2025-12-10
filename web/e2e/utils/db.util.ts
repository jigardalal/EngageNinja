import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';

let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL must be set');
    }
    prismaInstance = new PrismaClient({
      adapter: new PrismaPg({ connectionString: databaseUrl }),
    });
  }
  return prismaInstance;
}

export async function cleanDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL must be set');
  }

  const pool = new Pool({ connectionString: databaseUrl });
  try {
    const client = await pool.connect();
    try {
      // Try TRUNCATE first (faster)
      try {
        await client.query(
          'TRUNCATE TABLE "audit_logs","tenant_members","user_tenants","tenant_settings","tenants","users" CASCADE'
        );
      } catch (truncateError) {
        // Fallback to DELETE if TRUNCATE fails
        console.warn('⚠️ TRUNCATE failed, using DELETE:', (truncateError as Error).message);
        await client.query('DELETE FROM "audit_logs"');
        await client.query('DELETE FROM "tenant_members"');
        await client.query('DELETE FROM "user_tenants"');
        await client.query('DELETE FROM "tenant_settings"');
        await client.query('DELETE FROM "tenants"');
        await client.query('DELETE FROM "users"');
      }
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function disconnectPrisma() {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
}
