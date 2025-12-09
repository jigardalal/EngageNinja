import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PlanTier } from '../src/common/enums/plan-tier.enum';
import * as dotenv from 'dotenv';
import * as path from 'path';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';

// Type definitions for API responses
interface ApiResponse<T> {
  data?: T;
  error?: { code: string; message?: string };
}

interface TenantCreationResponse {
  id: string;
  name: string;
  settings: {
    planTier: PlanTier;
    capabilityFlags?: string[];
  };
}

interface AuthSignupResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: {
    email: string;
    lastUsedTenantId: string;
    planTier: PlanTier;
  };
  tenant: {
    id: string;
    name: string;
    settings: {
      planTier: PlanTier;
    };
  };
}

interface TenantListResponse {
  id: string;
  name: string;
  role: string;
}

interface SwitchTenantResponse {
  tokens: {
    accessToken: string;
  };
}

interface JwtPayload {
  activeTenantId: string;
  [key: string]: unknown;
}

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../packages/prisma/.env') });

describe('Tenants e2e', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL must be set for e2e tests');
    }
    prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: databaseUrl }),
    });
    await prisma.$connect();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "tenant_settings","audit_logs","user_tenants","users","tenants" CASCADE;',
    );
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  const signupWithPlan = async (planTier: PlanTier, email: string) => {
    const response = await request(app.getHttpServer() as unknown as string)
      .post('/auth/signup')
      .send({
        email,
        password: 'ValidPass123!',
        tenantName: `${email}-tenant`,
        planTier,
        region: 'us-east-1',
        capabilityFlags: ['core'],
      })
      .expect(201);

    const body = response.body as ApiResponse<AuthSignupResponse>;
    if (!body.data?.tokens.accessToken || !body.data?.tenant) {
      throw new Error('Invalid signup response');
    }
    const token = body.data.tokens.accessToken;
    return { token, tenant: body.data.tenant };
  };

  it('blocks tenant creation when starter limit reached', async () => {
    const { token } = await signupWithPlan(
      PlanTier.Starter,
      'starter-limit@example.com',
    );

    const res = await request(app.getHttpServer() as unknown as string)
      .post('/tenants')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Overflow Tenant',
        planTier: PlanTier.Starter,
        region: 'eu-west-1',
      })
      .expect(403);

    const body = res.body as ApiResponse<unknown>;
    expect(body.error?.code).toBe('TENANT_LIMIT_REACHED');
  });

  it('allows growth-tier users to create additional tenants', async () => {
    const { token } = await signupWithPlan(
      PlanTier.Growth,
      'growth-plan@example.com',
    );

    const res = await request(app.getHttpServer() as unknown as string)
      .post('/tenants')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Growth Tenant Two',
        planTier: PlanTier.Growth,
        region: 'us-west-2',
        capabilityFlags: ['resend', 'audit'],
      })
      .expect(201);

    const body = res.body as ApiResponse<TenantCreationResponse>;
    const created = body.data;
    expect(created?.settings.planTier).toBe(PlanTier.Growth);
    expect(created?.settings.capabilityFlags).toContain('resend');
  });

  it('lists all tenants for the authenticated user', async () => {
    const { token } = await signupWithPlan(
      PlanTier.Growth,
      'list-plan@example.com',
    );

    await request(app.getHttpServer() as unknown as string)
      .post('/tenants')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'List Tenant Two',
        planTier: PlanTier.Growth,
        region: 'ap-southeast-1',
      })
      .expect(201);

    const list = await request(app.getHttpServer() as unknown as string)
      .get('/tenants')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const body = list.body as ApiResponse<TenantListResponse[]>;
    expect(body.data).toHaveLength(2);
    expect(body.data?.[0].role).toBe('owner');
  });

  it('creates audit log on tenant creation', async () => {
    const { token } = await signupWithPlan(
      PlanTier.Growth,
      'audit-log@example.com',
    );

    const res = await request(app.getHttpServer() as unknown as string)
      .post('/tenants')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Audit Test Tenant',
        planTier: PlanTier.Growth,
        region: 'us-west-2',
        capabilityFlags: ['audit'],
      })
      .expect(201);

    const body = res.body as ApiResponse<TenantCreationResponse>;
    const tenantId = body.data?.id;
    if (!tenantId) {
      throw new Error('No tenantId in response');
    }

    // Verify audit log was created
    const auditLog = await prisma.auditLog.findFirst({
      where: { tenantId, action: 'tenant.create' },
    });

    expect(auditLog).toBeDefined();
    expect(auditLog?.action).toBe('tenant.create');
    expect(auditLog?.metadata).toEqual({
      planTier: PlanTier.Growth,
      region: 'us-west-2',
      capabilityFlags: ['audit'],
    });
  });

  it('blocks non-owner from deleting tenant', async () => {
    const { tenant: tenant1 } = await signupWithPlan(
      PlanTier.Growth,
      'owner@example.com',
    );
    const { token: token2 } = await signupWithPlan(
      PlanTier.Growth,
      'member@example.com',
    );

    // Add second user to tenant
    const memberUser = await prisma.user.findUniqueOrThrow({
      where: { email: 'member@example.com' },
    });
    await prisma.userTenant.create({
      data: {
        userId: memberUser.id,
        tenantId: tenant1.id,
        role: 'member',
      },
    });

    // Try to delete as non-owner
    const res = await request(app.getHttpServer() as unknown as string)
      .delete(`/tenants/${tenant1.id}`)
      .set('Authorization', `Bearer ${token2}`)
      .expect(403);

    const body = res.body as ApiResponse<unknown>;
    expect(body.error?.code).toBe('TENANT_DELETE_FORBIDDEN');
  });

  it('successfully switches tenant and updates JWT', async () => {
    const { token: token1 } = await signupWithPlan(
      PlanTier.Growth,
      'switch-test@example.com',
    );
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: 'switch-test@example.com' },
    });
    const userId = user.id;

    // Create second tenant
    const res2 = await request(app.getHttpServer() as unknown as string)
      .post('/tenants')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        name: 'Switch Target',
        planTier: PlanTier.Growth,
        region: 'eu-west-1',
      })
      .expect(201);

    const res2Body = res2.body as ApiResponse<TenantCreationResponse>;
    const secondTenantId = res2Body.data?.id;
    if (!secondTenantId) {
      throw new Error('No tenantId in response');
    }

    // Switch to second tenant
    const switchRes = await request(app.getHttpServer() as unknown as string)
      .post('/auth/switch-tenant')
      .set('Authorization', `Bearer ${token1}`)
      .send({ tenantId: secondTenantId })
      .expect(200);

    // Verify JWT now contains second tenant as activeTenantId
    const switchBody = switchRes.body as ApiResponse<SwitchTenantResponse>;
    const newAccessToken = switchBody.data?.tokens.accessToken;
    if (!newAccessToken) {
      throw new Error('No accessToken in response');
    }

    const tokenParts = newAccessToken.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const decoded = JSON.parse(
      Buffer.from(tokenParts[1], 'base64').toString(),
    ) as JwtPayload;
    expect(decoded.activeTenantId).toBe(secondTenantId);

    // Verify audit log for switch
    const auditLog = await prisma.auditLog.findFirst({
      where: { userId, action: 'auth.tenant.switch', tenantId: secondTenantId },
    });
    expect(auditLog).toBeDefined();
  });

  it('requires active tenant for tenant list endpoint', async () => {
    const { token } = await signupWithPlan(
      PlanTier.Growth,
      'active-tenant@example.com',
    );

    // Valid token should work
    const res = await request(app.getHttpServer() as unknown as string)
      .get('/tenants')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const body = res.body as ApiResponse<TenantListResponse[]>;
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
  });
});
