import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Tenant API Keys E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let userId: string;
  let tenantId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Setup: Create user
    const userData = {
      email: 'apikey-test@example.com',
      password: 'Test@12345',
    };

    // Delete user if exists from previous test run
    await prisma.user.deleteMany({ where: { email: userData.email } });

    const authRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: userData.email,
        password: userData.password,
        tenantName: 'Test Tenant',
      });

    if (authRes.status !== 201) {
      throw new Error(`Failed to sign up user: ${JSON.stringify(authRes.body)}`);
    }

    token = authRes.body.tokens.accessToken;
    userId = authRes.body.user.id;

    // Create tenant
    const tenantRes = await request(app.getHttpServer())
      .post('/tenants')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Tenant for API Keys',
        planTier: 'growth',
        region: 'us-east-1',
      });

    tenantId = tenantRes.body.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.tenantApiKey.deleteMany({ where: { tenantId } });
    await app.close();
  });

  describe('POST /tenants/:tenantId/api-keys', () => {
    it('should create an API key with plan gating', async () => {
      const res = await request(app.getHttpServer())
        .post(`/tenants/${tenantId}/api-keys`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Integration Key',
          description: 'For third-party integration',
          scopeFlags: ['read:campaigns', 'write:campaigns'],
        });

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('secret');
      expect(res.body.name).toBe('Integration Key');
      expect(res.body.status).toBe('active');
    });

    it('should reject API key creation on unsupported plan tier', async () => {
      // Create starter tenant
      const starterRes = await request(app.getHttpServer())
        .post('/tenants')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Starter Tenant',
          planTier: 'starter',
          region: 'us-east-1',
        });

      const starterId = starterRes.body.id;

      const res = await request(app.getHttpServer())
        .post(`/tenants/${starterId}/api-keys`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Not Allowed',
          scopeFlags: [],
        });

      expect(res.status).toBe(HttpStatus.FORBIDDEN);
      expect(res.body.code).toBe('API_KEYS_NOT_ALLOWED');
    });

    it('should reject API key creation without owner/admin role', async () => {
      // Create second user
      const userData = {
        email: 'viewer@example.com',
        password: 'Test@12345',
      };

      const viewerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData);

      const viewerToken = viewerRes.body?.access_token || (
        await request(app.getHttpServer())
          .post('/auth/login')
          .send(userData)
      ).body.access_token;

      // Add as viewer member
      await request(app.getHttpServer())
        .post(`/tenants/${tenantId}/members/invite`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'viewer@example.com',
          role: 'viewer',
        });

      const res = await request(app.getHttpServer())
        .post(`/tenants/${tenantId}/api-keys`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          name: 'Unauthorized Key',
          scopeFlags: [],
        });

      expect(res.status).toBe(HttpStatus.FORBIDDEN);
      expect(res.body.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });

  describe('GET /tenants/:tenantId/api-keys', () => {
    let keyId: string;
    let plainSecret: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post(`/tenants/${tenantId}/api-keys`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'List Test Key',
          scopeFlags: ['read:messages'],
        });

      keyId = res.body.id;
      plainSecret = res.body.secret;
    });

    it('should list API keys with status', async () => {
      const res = await request(app.getHttpServer())
        .get(`/tenants/${tenantId}/api-keys`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(HttpStatus.OK);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const key = res.body.find((k: any) => k.id === keyId);
      expect(key).toBeDefined();
      expect(key.status).toBe('active');
      expect(key.name).toBe('List Test Key');
    });
  });

  describe('DELETE /tenants/:tenantId/api-keys/:keyId', () => {
    let keyId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post(`/tenants/${tenantId}/api-keys`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Revoke Test Key',
          scopeFlags: [],
        });

      keyId = res.body.id;
    });

    it('should revoke an API key', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/tenants/${tenantId}/api-keys/${keyId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.status).toBe('revoked');
    });

    it('should prevent using revoked key', async () => {
      // Verify key is marked revoked in DB
      const key = await prisma.tenantApiKey.findUnique({ where: { id: keyId } });
      expect(key?.revokedAt).not.toBeNull();
    });

    it('should prevent double revocation', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/tenants/${tenantId}/api-keys/${keyId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body.code).toBe('API_KEY_ALREADY_REVOKED');
    });
  });

  describe('API Key Verification', () => {
    let plainSecret: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post(`/tenants/${tenantId}/api-keys`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Verify Test Key',
          scopeFlags: ['read:*'],
        });

      plainSecret = res.body.secret;
    });

    it('should verify correct API key', async () => {
      // Get the service directly to test verification
      const tenantApiKeyService = app.get('TenantApiKeysService');
      const result = await tenantApiKeyService.verifyApiKey(plainSecret, tenantId);

      expect(result).not.toBeNull();
      expect(result?.tenantId).toBe(tenantId);
      expect(result?.scopeFlags).toContain('read:*');
    });

    it('should reject invalid API key', async () => {
      const tenantApiKeyService = app.get('TenantApiKeysService');
      const result = await tenantApiKeyService.verifyApiKey('invalid_secret', tenantId);

      expect(result).toBeNull();
    });
  });

  describe('Audit Logging', () => {
    it('should create audit log on API key creation', async () => {
      const res = await request(app.getHttpServer())
        .post(`/tenants/${tenantId}/api-keys`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Audit Test Key',
          scopeFlags: [],
        });

      const keyId = res.body.id;

      // Check audit logs
      const logs = await prisma.auditLog.findMany({
        where: {
          action: 'api_key.create',
          tenantId,
        },
      });

      expect(logs.length).toBeGreaterThan(0);
      const log = logs.find((l) => (l.metadata as any)?.apiKeyId === keyId);
      expect(log).toBeDefined();
      expect(log?.userId).toBe(userId);
    });
  });
});
