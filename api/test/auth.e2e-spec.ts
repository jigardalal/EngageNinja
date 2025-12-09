import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

describe('Auth e2e', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
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
      'TRUNCATE TABLE "audit_logs","user_tenants","users","tenants" CASCADE;',
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
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(signupPayload)
      .expect(201);

    expect(res.body.error).toBeUndefined();
    const data = res.body.data;
    expect(data.user.email).toBe(signupPayload.email);
    expect(data.user.lastUsedTenantId).toBeDefined();
    expect(data.tenant.name).toBe(signupPayload.tenantName);
    expect(data.tokens.accessToken).toBeTruthy();
    expect(data.tokens.refreshToken).toBeTruthy();

    const dbUser = await prisma.user.findUnique({
      where: { email: signupPayload.email },
    });
    expect(dbUser?.passwordHash).toBeDefined();
    expect(dbUser?.passwordHash).not.toEqual(signupPayload.password);
    expect(dbUser?.lastUsedTenantId).toEqual(data.tenant.id);

    const membership = await prisma.userTenant.findFirst({
      where: { userId: dbUser?.id, tenantId: data.tenant.id },
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

    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(signupPayload)
      .expect(409);

    expect(res.body.error.code).toBe('AUTH_EMAIL_EXISTS');
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

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: 'ValidPass123!' })
      .expect(200);

    expect(res.body.data.tokens.accessToken).toBeTruthy();
    expect(res.body.data.user.lastUsedTenantId).toBe(tenant.id);
    expect(res.body.data.tenant.id).toBe(tenant.id);

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

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'invalid-user@example.com', password: 'wrong' })
      .expect(401);

    expect(res.body.data).toBeUndefined();
    expect(res.body.error.code).toBe('AUTH_INVALID_CREDENTIALS');
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
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'rate-user@example.com', password: 'wrong' })
        .expect(401);
    }

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'rate-user@example.com', password: 'wrong' })
      .expect(429);

    expect(res.body.error.code).toBe('AUTH_RATE_LIMITED');
  });

  it('requires authentication for profile lookup', async () => {
    const res = await request(app.getHttpServer()).get('/auth/me').expect(401);
    expect(res.body.error.code).toBe('AUTH_UNAUTHORIZED');
  });

  it('returns current user context with valid token', async () => {
    const resSignup = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ ...signupPayload, email: 'me-user@example.com' })
      .expect(201);

    const token = resSignup.body.data.tokens.accessToken as string;
    const me = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(me.body.data.user.email).toBe('me-user@example.com');
    expect(me.body.data.user.tenantId).toBe(resSignup.body.data.tenant.id);
  });

  it('switches tenant, issues new tokens, and logs audit', async () => {
    const passwordHash = await bcrypt.hash('ValidPass123!', 10);
    const primaryTenant = await prisma.tenant.create({ data: { name: 'Primary Tenant' } });
    const secondaryTenant = await prisma.tenant.create({ data: { name: 'Secondary Tenant' } });
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

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: 'ValidPass123!' })
      .expect(200);

    const token = login.body.data.tokens.accessToken as string;

    const switchRes = await request(app.getHttpServer())
      .post('/auth/switch-tenant')
      .set('Authorization', `Bearer ${token}`)
      .send({ tenantId: secondaryTenant.id })
      .expect(200);

    expect(switchRes.body.data.tenant.id).toBe(secondaryTenant.id);
    expect(switchRes.body.data.tokens.accessToken).toBeTruthy();

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updatedUser?.lastUsedTenantId).toBe(secondaryTenant.id);

    const auditLog = await prisma.auditLog.findFirst({
      where: { action: 'auth.tenant.switch', userId: user.id, tenantId: secondaryTenant.id },
    });
    expect(auditLog).toBeTruthy();
  });
});
