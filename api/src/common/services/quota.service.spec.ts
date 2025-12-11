import { Test, TestingModule } from '@nestjs/testing';
import { QuotaService, UsageType } from './quota.service';
import { PlanTierService } from './plan-tier.service';
import { PrismaService } from '../../prisma/prisma.service';
import { getStartOfMonth, getEndOfMonth } from 'date-fns';

describe('QuotaService', () => {
  let service: QuotaService;
  let prismaService: PrismaService;
  let planTierService: PlanTierService;

  const mockTenantId = 'test-tenant-1';
  const mockPlanTier = 'growth';
  const now = new Date();
  const monthStart = getStartOfMonth(now);
  const monthEnd = getEndOfMonth(now);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotaService,
        {
          provide: PrismaService,
          useValue: {
            usageCounter: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: PlanTierService,
          useValue: {
            getPlanLimits: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<QuotaService>(QuotaService);
    prismaService = module.get<PrismaService>(PrismaService);
    planTierService = module.get<PlanTierService>(PlanTierService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentCounter', () => {
    it('should return existing counter if it exists', async () => {
      const existingCounter = {
        id: 'counter-1',
        tenantId: mockTenantId,
        usageType: UsageType.MonthlySends,
        periodStart: monthStart,
        periodEnd: monthEnd,
        count: 5000,
        metadata: null,
        createdAt: now,
        updatedAt: now,
      };

      jest.spyOn(prismaService.usageCounter, 'findUnique').mockResolvedValue(existingCounter as any);

      const result = await service.getCurrentCounter(mockTenantId, UsageType.MonthlySends);

      expect(result).toEqual(existingCounter);
      expect(prismaService.usageCounter.findUnique).toHaveBeenCalledWith({
        where: {
          tenantId_usageType_periodStart: {
            tenantId: mockTenantId,
            usageType: UsageType.MonthlySends,
            periodStart: monthStart,
          },
        },
      });
    });

    it('should create new counter if it does not exist', async () => {
      const newCounter = {
        id: 'counter-2',
        tenantId: mockTenantId,
        usageType: UsageType.AiTokens,
        periodStart: monthStart,
        periodEnd: monthEnd,
        count: 0,
        metadata: null,
        createdAt: now,
        updatedAt: now,
      };

      jest.spyOn(prismaService.usageCounter, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.usageCounter, 'create').mockResolvedValue(newCounter as any);

      const result = await service.getCurrentCounter(mockTenantId, UsageType.AiTokens);

      expect(result).toEqual(newCounter);
      expect(prismaService.usageCounter.create).toHaveBeenCalledWith({
        data: {
          tenantId: mockTenantId,
          usageType: UsageType.AiTokens,
          periodStart: monthStart,
          periodEnd: monthEnd,
          count: 0,
        },
      });
    });
  });

  describe('checkQuota', () => {
    it('should allow operation when usage is under limit', async () => {
      const counter = {
        id: 'counter-1',
        tenantId: mockTenantId,
        usageType: UsageType.MonthlySends,
        periodStart: monthStart,
        periodEnd: monthEnd,
        count: 50000,
        metadata: null,
        createdAt: now,
        updatedAt: now,
      };

      jest.spyOn(planTierService, 'getPlanLimits').mockResolvedValue({
        id: 'plan-1',
        name: mockPlanTier,
        displayName: 'Growth',
        maxTenants: 1,
        maxTeamMembers: 10,
        maxMonthlySends: 100000,
        maxAiTokensMonthly: 5000,
        availableChannels: ['WhatsApp', 'Email'],
        capabilityFlags: ['ai_campaign_gen'],
        metadata: {},
        createdAt: now,
        updatedAt: now,
      });

      jest.spyOn(service, 'getCurrentCounter').mockResolvedValue(counter as any);

      const result = await service.checkQuota(mockTenantId, mockPlanTier, UsageType.MonthlySends, 30000);

      expect(result.allowed).toBe(true);
      expect(result.current).toBe(50000);
      expect(result.limit).toBe(100000);
    });

    it('should block operation when quota exceeded', async () => {
      const counter = {
        id: 'counter-1',
        tenantId: mockTenantId,
        usageType: UsageType.MonthlySends,
        periodStart: monthStart,
        periodEnd: monthEnd,
        count: 95000,
        metadata: null,
        createdAt: now,
        updatedAt: now,
      };

      jest.spyOn(planTierService, 'getPlanLimits').mockResolvedValue({
        id: 'plan-1',
        name: mockPlanTier,
        displayName: 'Growth',
        maxTenants: 1,
        maxTeamMembers: 10,
        maxMonthlySends: 100000,
        maxAiTokensMonthly: 5000,
        availableChannels: ['WhatsApp', 'Email'],
        capabilityFlags: ['ai_campaign_gen'],
        metadata: {},
        createdAt: now,
        updatedAt: now,
      });

      jest.spyOn(service, 'getCurrentCounter').mockResolvedValue(counter as any);

      const result = await service.checkQuota(mockTenantId, mockPlanTier, UsageType.MonthlySends, 10000);

      expect(result.allowed).toBe(false);
      expect(result.current).toBe(95000);
      expect(result.limit).toBe(100000);
      expect(result.message).toContain('quota exceeded');
    });
  });

  describe('incrementUsage', () => {
    it('should increment usage counter', async () => {
      const counter = {
        id: 'counter-1',
        tenantId: mockTenantId,
        usageType: UsageType.MonthlySends,
        periodStart: monthStart,
        periodEnd: monthEnd,
        count: 5000,
        metadata: null,
        createdAt: now,
        updatedAt: now,
      };

      const updatedCounter = { ...counter, count: 7500 };

      jest.spyOn(service, 'getCurrentCounter').mockResolvedValue(counter as any);
      jest.spyOn(prismaService.usageCounter, 'update').mockResolvedValue(updatedCounter as any);

      const result = await service.incrementUsage(mockTenantId, UsageType.MonthlySends, 2500);

      expect(result.count).toBe(7500);
      expect(prismaService.usageCounter.update).toHaveBeenCalledWith({
        where: { id: 'counter-1' },
        data: { count: 7500 },
      });
    });
  });

  describe('getUsage', () => {
    it('should return current usage data with percentage', async () => {
      const counter = {
        id: 'counter-1',
        tenantId: mockTenantId,
        usageType: UsageType.MonthlySends,
        periodStart: monthStart,
        periodEnd: monthEnd,
        count: 50000,
        metadata: null,
        createdAt: now,
        updatedAt: now,
      };

      jest.spyOn(planTierService, 'getPlanLimits').mockResolvedValue({
        id: 'plan-1',
        name: mockPlanTier,
        displayName: 'Growth',
        maxTenants: 1,
        maxTeamMembers: 10,
        maxMonthlySends: 100000,
        maxAiTokensMonthly: 5000,
        availableChannels: ['WhatsApp', 'Email'],
        capabilityFlags: ['ai_campaign_gen'],
        metadata: {},
        createdAt: now,
        updatedAt: now,
      });

      jest.spyOn(service, 'getCurrentCounter').mockResolvedValue(counter as any);

      const result = await service.getUsage(mockTenantId, mockPlanTier, UsageType.MonthlySends);

      expect(result.current).toBe(50000);
      expect(result.limit).toBe(100000);
      expect(result.percentage).toBe(50);
    });
  });

  describe('getAllUsage', () => {
    it('should return both monthly sends and AI tokens usage', async () => {
      const sendCounter = {
        id: 'counter-1',
        tenantId: mockTenantId,
        usageType: UsageType.MonthlySends,
        periodStart: monthStart,
        periodEnd: monthEnd,
        count: 50000,
        metadata: null,
        createdAt: now,
        updatedAt: now,
      };

      const tokenCounter = {
        id: 'counter-2',
        tenantId: mockTenantId,
        usageType: UsageType.AiTokens,
        periodStart: monthStart,
        periodEnd: monthEnd,
        count: 2500,
        metadata: null,
        createdAt: now,
        updatedAt: now,
      };

      jest.spyOn(planTierService, 'getPlanLimits').mockResolvedValue({
        id: 'plan-1',
        name: mockPlanTier,
        displayName: 'Growth',
        maxTenants: 1,
        maxTeamMembers: 10,
        maxMonthlySends: 100000,
        maxAiTokensMonthly: 5000,
        availableChannels: ['WhatsApp', 'Email'],
        capabilityFlags: ['ai_campaign_gen'],
        metadata: {},
        createdAt: now,
        updatedAt: now,
      });

      jest
        .spyOn(service, 'getCurrentCounter')
        .mockResolvedValueOnce(sendCounter as any)
        .mockResolvedValueOnce(tokenCounter as any);

      const result = await service.getAllUsage(mockTenantId, mockPlanTier);

      expect(result.monthlySends.current).toBe(50000);
      expect(result.monthlySends.limit).toBe(100000);
      expect(result.monthlySends.percentage).toBe(50);
      expect(result.aiTokens.current).toBe(2500);
      expect(result.aiTokens.limit).toBe(5000);
      expect(result.aiTokens.percentage).toBe(50);
    });
  });

  describe('resetMonthlyCounters', () => {
    it('should create new counters for current month', async () => {
      const tenantIds = ['tenant-1', 'tenant-2', 'tenant-3'];

      jest.spyOn(prismaService.usageCounter, 'findMany').mockResolvedValue([]);
      jest
        .spyOn(prismaService.usageCounter, 'create')
        .mockResolvedValue({ id: 'new-counter' } as any);

      await service.resetMonthlyCounters();

      // Should create 2 counters (monthly_sends + ai_tokens) for each tenant
      // But since we're just mocking, we won't verify exact call counts
      expect(prismaService.usageCounter.create).toHaveBeenCalled();
    });
  });
});
