import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PlanTier } from '../src/common/enums/plan-tier.enum';
import * as bcrypt from 'bcrypt';
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

interface SignupResponse {
  error?: unknown;
  user: {
    email: string;
    lastUsedTenantId: string;
    planTier: PlanTier;
  };
  tenant: {
    id: string;
    name: string;
    settings?: {
      planTier: PlanTier;
    };
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

interface LoginResponse {
  tokens: {
    accessToken: string;
  };
  user: {
    lastUsedTenantId: string;
  };
  tenant: {
    id: string;
  };
}

interface MeResponse {
  user: {
    email: string;
    tenantId: string;
    planTier: PlanTier;
  };
}

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../packages/prisma/.env') });

describe('Auth e2e', () => {
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

  const signupPayload = {
    email: 'new-user@example.com',
    password: 'ValidPass123!',
    tenantName: 'Acme Agency',
  };

  it('signs up a new user, creates tenant, and returns tokens', async () => {
    const res = await request(app.getHttpServer() as unknown as string)
      .post('/auth/signup')
      .send(signupPayload)
      .expect(201);

    const body = res.body as ApiResponse<SignupResponse>;
    expect(body.error).toBeUndefined();
    const data = body.data;
    expect(data?.user.email).toBe(signupPayload.email);
    expect(data?.user.lastUsedTenantId).toBeDefined();
    expect(data?.tenant.name).toBe(signupPayload.tenantName);
    expect(data?.user.planTier).toBe(PlanTier.Starter);
    expect(data?.tenant.settings?.planTier).toBe(PlanTier.Starter);
    expect(data?.tokens.accessToken).toBeTruthy();
    expect(data?.tokens.refreshToken).toBeTruthy();

    const tenantId = data?.tenant.id;
    if (!tenantId) {
      throw new Error('No tenant id in response');
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: signupPayload.email },
    });
    expect(dbUser?.passwordHash).toBeDefined();
    expect(dbUser?.passwordHash).not.toEqual(signupPayload.password);
    expect(dbUser?.lastUsedTenantId).toEqual(tenantId);

    const membership = await prisma.userTenant.findFirst({
      where: { userId: dbUser?.id, tenantId },
    });
    expect(membership?.role).toBe('owner');

    const auditLog = await prisma.auditLog.findFirst({
      where: { action: 'auth.signup' },
    });
    expect(auditLog).toBeTruthy();
  });

  it('rejects duplicate emails with AUTH_EMAIL_EXISTS', async () => {
    const passwordHash = await bcrypt.hash('ValidPass123!', 10);

    await prisma.user.create({
      data: {
        email: signupPayload.email,

        passwordHash,
      },
    });

    const res = await request(app.getHttpServer() as unknown as string)
      .post('/auth/signup')
      .send(signupPayload)
      .expect(409);

    const body = res.body as ApiResponse<unknown>;
    expect(body.error?.code).toBe('AUTH_EMAIL_EXISTS');
  });

  it('logs in existing user and returns tokens with last_used_tenant', async () => {
    const passwordHash = await bcrypt.hash('ValidPass123!', 10);
    const tenant = await prisma.tenant.create({
      data: { name: 'Existing Tenant' },
    });

    const user = await prisma.user.create({
      data: {
        email: 'login-user@example.com',

        passwordHash,
        lastUsedTenantId: tenant.id,
        userTenants: {
          create: [{ tenantId: tenant.id, role: 'owner' }],
        },
      },
      include: { userTenants: true },
    });

    const res = await request(app.getHttpServer() as unknown as string)
      .post('/auth/login')
      .send({ email: user.email, password: 'ValidPass123!' })
      .expect(200);

    const body = res.body as ApiResponse<LoginResponse>;
    expect(body.data?.tokens.accessToken).toBeTruthy();
    expect(body.data?.user.lastUsedTenantId).toBe(tenant.id);
    expect(body.data?.tenant.id).toBe(tenant.id);

    const auditLog = await prisma.auditLog.findFirst({
      where: { action: 'auth.login.success', userId: user.id },
    });
    expect(auditLog).toBeTruthy();
  });

  it('returns invalid credentials error and keeps user signed out', async () => {
    const passwordHash = await bcrypt.hash('ValidPass123!', 10);

    await prisma.user.create({
      data: {
        email: 'invalid-user@example.com',

        passwordHash,
      },
    });

    const res = await request(app.getHttpServer() as unknown as string)
      .post('/auth/login')
      .send({ email: 'invalid-user@example.com', password: 'wrong' })
      .expect(401);

    const body = res.body as ApiResponse<unknown>;
    expect(body.data).toBeUndefined();
    expect(body.error?.code).toBe('AUTH_INVALID_CREDENTIALS');
  });

  it('rate limits repeated login attempts', async () => {
    const passwordHash = await bcrypt.hash('ValidPass123!', 10);

    await prisma.user.create({
      data: {
        email: 'rate-user@example.com',

        passwordHash,
      },
    });

    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer() as unknown as string)
        .post('/auth/login')
        .send({ email: 'rate-user@example.com', password: 'wrong' })
        .expect(401);
    }

    const res = await request(app.getHttpServer() as unknown as string)
      .post('/auth/login')
      .send({ email: 'rate-user@example.com', password: 'wrong' })
      .expect(429);

    const body = res.body as ApiResponse<unknown>;
    expect(body.error?.code).toBe('AUTH_RATE_LIMITED');
  });

  it('requires authentication for profile lookup', async () => {
    const res = await request(app.getHttpServer() as unknown as string)
      .get('/auth/me')
      .expect(401);
    const body = res.body as ApiResponse<unknown>;
    expect(body.error?.code).toBe('AUTH_UNAUTHORIZED');
  });

  it('returns current user context with valid token', async () => {
    const resSignup = await request(app.getHttpServer() as unknown as string)
      .post('/auth/signup')
      .send({ ...signupPayload, email: 'me-user@example.com' })
      .expect(201);

    const signupBody = resSignup.body as ApiResponse<SignupResponse>;
    const token = signupBody.data?.tokens.accessToken;
    const tenantId = signupBody.data?.tenant.id;
    if (!token || !tenantId) {
      throw new Error('Invalid signup response');
    }

    const me = await request(app.getHttpServer() as unknown as string)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const meBody = me.body as ApiResponse<MeResponse>;
    expect(meBody.data?.user.email).toBe('me-user@example.com');
    expect(meBody.data?.user.tenantId).toBe(tenantId);
    expect(meBody.data?.user.planTier).toBe(PlanTier.Starter);
  });

  it('switches tenant, issues new tokens, and logs audit', async () => {
    const passwordHash = await bcrypt.hash('ValidPass123!', 10);
    const primaryTenant = await prisma.tenant.create({
      data: { name: 'Primary Tenant' },
    });
    const secondaryTenant = await prisma.tenant.create({
      data: { name: 'Secondary Tenant' },
    });

    const user = await prisma.user.create({
      data: {
        email: 'switch-user@example.com',

        passwordHash,
        lastUsedTenantId: primaryTenant.id,
        userTenants: {
          create: [
            { tenantId: primaryTenant.id, role: 'owner' },
            { tenantId: secondaryTenant.id, role: 'owner' },
          ],
        },
      },
      include: { userTenants: true },
    });

    const login = await request(app.getHttpServer() as unknown as string)
      .post('/auth/login')
      .send({ email: user.email, password: 'ValidPass123!' })
      .expect(200);

    const loginBody = login.body as ApiResponse<LoginResponse>;
    const token = loginBody.data?.tokens.accessToken;
    if (!token) {
      throw new Error('No accessToken in response');
    }

    const switchRes = await request(app.getHttpServer() as unknown as string)
      .post('/auth/switch-tenant')
      .set('Authorization', `Bearer ${token}`)
      .send({ tenantId: secondaryTenant.id })
      .expect(200);

    interface SwitchResponse {
      tenant: { id: string };
      tokens: { accessToken: string };
    }
    const switchBody = switchRes.body as ApiResponse<SwitchResponse>;
    expect(switchBody.data?.tenant.id).toBe(secondaryTenant.id);
    expect(switchBody.data?.tokens.accessToken).toBeTruthy();

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    expect(updatedUser?.lastUsedTenantId).toBe(secondaryTenant.id);

    const auditLog = await prisma.auditLog.findFirst({
      where: {
        action: 'auth.tenant.switch',
        userId: user.id,
        tenantId: secondaryTenant.id,
      },
    });
    expect(auditLog).toBeTruthy();
  });
});
