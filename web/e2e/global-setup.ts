import * as dotenv from 'dotenv';
import * as path from 'path';
import { cleanDatabase, disconnectPrisma } from './utils/db.util';

dotenv.config({ path: path.resolve(__dirname, '.env.e2e') });
dotenv.config({ path: path.resolve(__dirname, '../../packages/prisma/.env') });

async function globalSetup() {
  console.log('🧹 Setting up E2E test environment...');

  try {
    await cleanDatabase();
    console.log('✅ Database cleaned');
    await disconnectPrisma();
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    await disconnectPrisma();
    throw error;
  }
}

export default globalSetup;
