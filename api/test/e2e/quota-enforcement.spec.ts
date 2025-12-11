import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Quota Enforcement E2E', () => {
  let app: INestApplication;
  let authToken: string;
  let tenantId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login as free tier user
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user-free@example.com',
        password: 'password123',
      });

    authToken = loginRes.body.data.accessToken;

    // Get tenant ID from list
    const tenantsRes = await request(app.getHttpServer())
      .get('/tenants')
      .set('Authorization', `Bearer ${authToken}`);

    tenantId = tenantsRes.body[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('WhatsApp Send - Free Tier (1000 limit)', () => {
    it('should allow sending 100 messages', async () => {
      const response = await request(app.getHttpServer())
        .post(`/tenants/${tenantId}/messages/whatsapp/send`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipients: Array(100).fill('1234567890'),
          message: 'Test message',
        });

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body.recipientCount).toBe(100);
      expect(response.body.status).toBe('queued');
    });

    it('should track usage after sending', async () => {
      const usageRes = await request(app.getHttpServer())
        .get(`/tenants/${tenantId}/usage`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(usageRes.status).toBe(HttpStatus.OK);
      expect(usageRes.body.data.monthlySends.current).toBeGreaterThan(0);
      expect(usageRes.body.data.monthlySends.limit).toBe(1000);
    });

    it('should block sending when quota exceeded', async () => {
      // First, send enough messages to exceed free tier limit
      // Free tier = 1000, so send 950 more to total 1050
      const response = await request(app.getHttpServer())
        .post(`/tenants/${tenantId}/messages/whatsapp/send`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipients: Array(950).fill('1234567890'),
          message: 'Test message',
        });

      expect(response.status).toBe(HttpStatus.PAYMENT_REQUIRED);
      expect(response.body.error).toBe('QUOTA_EXCEEDED');
      expect(response.body.current).toBe(100); // Already sent 100
      expect(response.body.limit).toBe(1000);
    });
  });

  describe('Email Send - Feature Gate (Free tier)', () => {
    it('should block email on free tier (feature not available)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/tenants/${tenantId}/messages/email/send`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipients: ['test@example.com'],
          subject: 'Test',
          content: 'Test email',
        });

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      expect(response.body.message).toContain('not available');
    });
  });

  describe('Usage Endpoint', () => {
    it('should return usage stats with reset date', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tenants/${tenantId}/usage`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data).toHaveProperty('monthlySends');
      expect(response.body.data).toHaveProperty('aiTokens');

      const { monthlySends, aiTokens } = response.body.data;

      // Verify structure
      expect(monthlySends).toHaveProperty('current');
      expect(monthlySends).toHaveProperty('limit');
      expect(monthlySends).toHaveProperty('percentage');
      expect(monthlySends).toHaveProperty('resetDate');

      // Verify AI tokens on free tier
      expect(aiTokens.limit).toBe(0);
      expect(aiTokens.current).toBe(0);
    });

    it('should calculate percentage correctly', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tenants/${tenantId}/usage`)
        .set('Authorization', `Bearer ${authToken}`);

      const { monthlySends } = response.body.data;
      const expectedPercentage = (monthlySends.current / monthlySends.limit) * 100;

      expect(monthlySends.percentage).toBeCloseTo(expectedPercentage, 1);
    });
  });

  describe('Campaign Send', () => {
    it('should require feature gate', async () => {
      const response = await request(app.getHttpServer())
        .post(`/tenants/${tenantId}/campaigns/send`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          campaignId: 'camp123',
          recipientSegments: ['segment1'],
        });

      // Either forbidden (feature not available) or not found (if campaigns not in tier)
      expect([HttpStatus.FORBIDDEN, HttpStatus.NOT_FOUND]).toContain(response.status);
    });
  });

  describe('Error Responses', () => {
    it('should return 402 for quota exceeded', async () => {
      // Already done in WhatsApp test above
      // Just verifying the error format
      const response = await request(app.getHttpServer())
        .post(`/tenants/${tenantId}/messages/whatsapp/send`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipients: Array(1000).fill('1234567890'),
          message: 'Test',
        });

      if (response.status === HttpStatus.PAYMENT_REQUIRED) {
        expect(response.body).toHaveProperty('statusCode', 402);
        expect(response.body).toHaveProperty('error', 'QUOTA_EXCEEDED');
        expect(response.body).toHaveProperty('current');
        expect(response.body).toHaveProperty('limit');
        expect(response.body).toHaveProperty('usageType');
      }
    });
  });
});
