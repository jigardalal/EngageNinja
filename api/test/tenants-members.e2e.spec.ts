import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('Tenant Members (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let authToken: string;
  let adminToken: string;
  let userId: string;
  let adminUserId: string;
  let tenantId: string;
  let memberId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Create owner user and tenant
    const ownerUser = await prisma.user.create({
      data: { email: 'owner@test.com', passwordHash: 'hash' },
    });
    userId = ownerUser.id;

    const tenant = await prisma.tenant.create({
      data: { name: 'Test Tenant' },
    });
    tenantId = tenant.id;

    await prisma.userTenant.create({
      data: { userId, tenantId, role: 'owner', lastActiveAt: new Date() },
    });

    await prisma.tenantSetting.create({
      data: { tenantId, planTier: 'growth', region: 'us-east-1' },
    });

    // Create admin user
    const admin = await prisma.user.create({
      data: { email: 'admin@test.com', passwordHash: 'hash' },
    });
    adminUserId = admin.id;

    await prisma.userTenant.create({
      data: {
        userId: adminUserId,
        tenantId,
        role: 'admin',
        lastActiveAt: new Date(),
      },
    });

    // Generate JWT tokens
    authToken = jwtService.sign({
      userId,
      email: ownerUser.email,
      tenantId,
      activeTenantId: tenantId,
      planTier: 'growth',
      capabilityFlags: [],
    });

    adminToken = jwtService.sign({
      userId: adminUserId,
      email: admin.email,
      tenantId,
      activeTenantId: tenantId,
      planTier: 'growth',
      capabilityFlags: [],
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /tenants/:tenantId/members/invite', () => {
    it('should invite a new member', async () => {
      const response = await request(app.getHttpServer())
        .post(`/tenants/${tenantId}/members/invite`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'newmember@test.com',
          role: 'marketer',
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe('newmember@test.com');
      expect(response.body.data.role).toBe('marketer');
      expect(response.body.data.status).toBe('pending');

      memberId = response.body.data.id;
    });

    it('should not allow non-admin/owner to invite', async () => {
      const viewer = await prisma.user.create({
        data: { email: 'viewer@test.com', passwordHash: 'hash' },
      });

      await prisma.userTenant.create({
        data: {
          userId: viewer.id,
          tenantId,
          role: 'viewer',
          lastActiveAt: new Date(),
        },
      });

      const viewerToken = jwtService.sign({
        userId: viewer.id,
        email: viewer.email,
        tenantId,
        activeTenantId: tenantId,
        planTier: 'growth',
        capabilityFlags: [],
      });

      await request(app.getHttpServer())
        .post(`/tenants/${tenantId}/members/invite`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          email: 'someone@test.com',
          role: 'marketer',
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should validate email format', async () => {
      await request(app.getHttpServer())
        .post(`/tenants/${tenantId}/members/invite`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'invalid-email',
          role: 'marketer',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should validate role enum', async () => {
      await request(app.getHttpServer())
        .post(`/tenants/${tenantId}/members/invite`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'test@test.com',
          role: 'invalid_role',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /tenants/:tenantId/members', () => {
    it('should list all members', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tenants/${tenantId}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should not allow non-members to list', async () => {
      const stranger = await prisma.user.create({
        data: { email: 'stranger@test.com', passwordHash: 'hash' },
      });

      const strangerToken = jwtService.sign({
        userId: stranger.id,
        email: stranger.email,
        tenantId: 'other-tenant',
        activeTenantId: 'other-tenant',
        planTier: 'starter',
        capabilityFlags: [],
      });

      await request(app.getHttpServer())
        .get(`/tenants/${tenantId}/members`)
        .set('Authorization', `Bearer ${strangerToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('PUT /tenants/:tenantId/members/:memberId/role', () => {
    it('should update member role', async () => {
      const response = await request(app.getHttpServer())
        .put(`/tenants/${tenantId}/members/${memberId}/role`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          role: 'admin',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.role).toBe('admin');
    });

    it('should not allow non-admin to update roles', async () => {
      const viewer = await prisma.user.create({
        data: { email: 'viewer2@test.com', passwordHash: 'hash' },
      });

      await prisma.userTenant.create({
        data: {
          userId: viewer.id,
          tenantId,
          role: 'viewer',
          lastActiveAt: new Date(),
        },
      });

      const viewerToken = jwtService.sign({
        userId: viewer.id,
        email: viewer.email,
        tenantId,
        activeTenantId: tenantId,
        planTier: 'growth',
        capabilityFlags: [],
      });

      await request(app.getHttpServer())
        .put(`/tenants/${tenantId}/members/${memberId}/role`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ role: 'viewer' })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should return 404 for non-existent member', async () => {
      await request(app.getHttpServer())
        .put(`/tenants/${tenantId}/members/nonexistent-id/role`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ role: 'viewer' })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /tenants/:tenantId/members/:memberId', () => {
    it('should revoke member access', async () => {
      await request(app.getHttpServer())
        .delete(`/tenants/${tenantId}/members/${memberId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.NO_CONTENT);

      // Verify member is deleted
      const members = await prisma.tenantMember.findFirst({
        where: { id: memberId },
      });
      expect(members).toBeNull();
    });

    it('should create audit log on revoke', async () => {
      const member = await prisma.tenantMember.create({
        data: {
          tenantId,
          email: 'temp@test.com',
          role: 'marketer',
          invitedBy: userId,
        },
      });

      await request(app.getHttpServer())
        .delete(`/tenants/${tenantId}/members/${member.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.NO_CONTENT);

      const auditLog = await prisma.auditLog.findFirst({
        where: { action: 'tenant.member.revoke' },
        orderBy: { createdAt: 'desc' },
      });

      expect(auditLog).toBeDefined();
      expect(auditLog?.metadata).toMatchObject({
        revokedEmail: 'temp@test.com',
      });
    });

    it('should not allow non-admin to revoke', async () => {
      const viewer = await prisma.user.create({
        data: { email: 'viewer3@test.com', passwordHash: 'hash' },
      });

      await prisma.userTenant.create({
        data: {
          userId: viewer.id,
          tenantId,
          role: 'viewer',
          lastActiveAt: new Date(),
        },
      });

      const viewerToken = jwtService.sign({
        userId: viewer.id,
        email: viewer.email,
        tenantId,
        activeTenantId: tenantId,
        planTier: 'growth',
        capabilityFlags: [],
      });

      const member = await prisma.tenantMember.create({
        data: {
          tenantId,
          email: 'temp2@test.com',
          role: 'marketer',
          invitedBy: userId,
        },
      });

      await request(app.getHttpServer())
        .delete(`/tenants/${tenantId}/members/${member.id}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('Audit logging', () => {
    it('should log invite actions', async () => {
      await request(app.getHttpServer())
        .post(`/tenants/${tenantId}/members/invite`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'audit-test@test.com',
          role: 'viewer',
        })
        .expect(HttpStatus.CREATED);

      const logs = await prisma.auditLog.findMany({
        where: {
          action: 'tenant.member.invite',
          tenantId,
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].metadata).toMatchObject({
        invitedEmail: 'audit-test@test.com',
        role: 'viewer',
      });
    });

    it('should log role update actions', async () => {
      const member = await prisma.tenantMember.create({
        data: {
          tenantId,
          email: 'audit-role@test.com',
          role: 'viewer',
          invitedBy: userId,
        },
      });

      await request(app.getHttpServer())
        .put(`/tenants/${tenantId}/members/${member.id}/role`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ role: 'marketer' })
        .expect(HttpStatus.OK);

      const logs = await prisma.auditLog.findMany({
        where: {
          action: 'tenant.member.role_update',
          tenantId,
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].metadata).toMatchObject({
        newRole: 'marketer',
        previousRole: 'viewer',
      });
    });
  });

  describe('Plan Limit Enforcement', () => {
    it('blocks invite when member limit reached for Starter plan', async () => {
      // Create a Starter tenant (limit = 1 member)
      const starterUser = await prisma.user.create({
        data: { email: 'starter@test.com', passwordHash: 'hash', planTier: 'starter' },
      });

      const starterTenant = await prisma.tenant.create({
        data: { name: 'Starter Tenant' },
      });

      await prisma.tenantSetting.create({
        data: { tenantId: starterTenant.id, planTier: 'starter', region: 'us-east-1' },
      });

      await prisma.userTenant.create({
        data: {
          userId: starterUser.id,
          tenantId: starterTenant.id,
          role: 'owner',
          lastActiveAt: new Date(),
        },
      });

      // Create and accept first member (reaches limit)
      await prisma.tenantMember.create({
        data: {
          tenantId: starterTenant.id,
          email: 'member1@test.com',
          role: 'marketer',
          status: 'accepted',
          invitedBy: starterUser.id,
        },
      });

      const starterToken = jwtService.sign({
        userId: starterUser.id,
        email: starterUser.email,
        tenantId: starterTenant.id,
        activeTenantId: starterTenant.id,
        planTier: 'starter',
        capabilityFlags: [],
      });

      // Try to invite second member - should fail
      const response = await request(app.getHttpServer())
        .post(`/tenants/${starterTenant.id}/members/invite`)
        .set('Authorization', `Bearer ${starterToken}`)
        .send({
          email: 'member2@test.com',
          role: 'marketer',
        })
        .expect(HttpStatus.FORBIDDEN);

      expect(response.body.error?.code).toBe('MEMBER_LIMIT_REACHED');
      expect(response.body.error?.message).toContain('1 member');
    });

    it('allows invite when pending members exist but do not count toward limit', async () => {
      // Starter tenant with 1 pending invite should still allow invites
      const starterUser = await prisma.user.create({
        data: { email: 'starter2@test.com', passwordHash: 'hash', planTier: 'starter' },
      });

      const starterTenant = await prisma.tenant.create({
        data: { name: 'Starter Tenant 2' },
      });

      await prisma.tenantSetting.create({
        data: { tenantId: starterTenant.id, planTier: 'starter', region: 'us-east-1' },
      });

      await prisma.userTenant.create({
        data: {
          userId: starterUser.id,
          tenantId: starterTenant.id,
          role: 'owner',
          lastActiveAt: new Date(),
        },
      });

      // Create pending invite (does NOT count toward limit)
      await prisma.tenantMember.create({
        data: {
          tenantId: starterTenant.id,
          email: 'pending@test.com',
          role: 'marketer',
          status: 'pending',
          invitedBy: starterUser.id,
        },
      });

      const starterToken = jwtService.sign({
        userId: starterUser.id,
        email: starterUser.email,
        tenantId: starterTenant.id,
        activeTenantId: starterTenant.id,
        planTier: 'starter',
        capabilityFlags: [],
      });

      // Should succeed because pending doesn't count
      await request(app.getHttpServer())
        .post(`/tenants/${starterTenant.id}/members/invite`)
        .set('Authorization', `Bearer ${starterToken}`)
        .send({
          email: 'newmember@test.com',
          role: 'marketer',
        })
        .expect(HttpStatus.CREATED);
    });

    it('allows Growth plan to invite up to 5 members', async () => {
      // Create Growth tenant and add 4 accepted members, 5th should succeed
      const growthUser = await prisma.user.create({
        data: { email: 'growth@test.com', passwordHash: 'hash', planTier: 'growth' },
      });

      const growthTenant = await prisma.tenant.create({
        data: { name: 'Growth Tenant' },
      });

      await prisma.tenantSetting.create({
        data: { tenantId: growthTenant.id, planTier: 'growth', region: 'us-east-1' },
      });

      await prisma.userTenant.create({
        data: {
          userId: growthUser.id,
          tenantId: growthTenant.id,
          role: 'owner',
          lastActiveAt: new Date(),
        },
      });

      // Add 4 accepted members
      for (let i = 1; i <= 4; i++) {
        await prisma.tenantMember.create({
          data: {
            tenantId: growthTenant.id,
            email: `member${i}@test.com`,
            role: 'marketer',
            status: 'accepted',
            invitedBy: growthUser.id,
          },
        });
      }

      const growthToken = jwtService.sign({
        userId: growthUser.id,
        email: growthUser.email,
        tenantId: growthTenant.id,
        activeTenantId: growthTenant.id,
        planTier: 'growth',
        capabilityFlags: [],
      });

      // 5th member should succeed (Growth limit = 5)
      await request(app.getHttpServer())
        .post(`/tenants/${growthTenant.id}/members/invite`)
        .set('Authorization', `Bearer ${growthToken}`)
        .send({
          email: 'member5@test.com',
          role: 'marketer',
        })
        .expect(HttpStatus.CREATED);

      // 6th member should fail
      const response = await request(app.getHttpServer())
        .post(`/tenants/${growthTenant.id}/members/invite`)
        .set('Authorization', `Bearer ${growthToken}`)
        .send({
          email: 'member6@test.com',
          role: 'marketer',
        })
        .expect(HttpStatus.FORBIDDEN);

      expect(response.body.error?.code).toBe('MEMBER_LIMIT_REACHED');
    });
  });
});
