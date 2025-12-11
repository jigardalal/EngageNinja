import { Test, TestingModule } from '@nestjs/testing';
import { QuotaService, UsageType } from '../../src/common/services/quota.service';
import { PlanTierService } from '../../src/common/services/plan-tier.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { startOfMonth, endOfMonth } from 'date-fns';

describe('QuotaService', () => {
  let service: QuotaService;
  let planTierService: PlanTierService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    usageCounter: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockPlanTierService = {
    getPlanLimits: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotaService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: PlanTierService,
          useValue: mockPlanTierService,
        },
      ],
    }).compile();

    service = module.get<QuotaService>(QuotaService);
    planTierService = module.get<PlanTierService>(PlanTierService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkQuota', () => {
    it('should allow when usage is below limit', async () => {
      mockPlanTierService.getPlanLimits.mockResolvedValue({
        maxMonthlySends: 1000,
      });

      mockPrismaService.usageCounter.findUnique.mockResolvedValue({
        usage: 500,
      });

      const result = await service.checkQuota(
        'tenant123',
        UsageType.MonthlySends,
        100,
      );

      expect(result.allowed).toBe(true);
      expect(result.current).toBe(500);
      expect(result.limit).toBe(1000);
    });

    it('should allow when usage + requested equals limit', async () => {
      mockPlanTierService.getPlanLimits.mockResolvedValue({
        maxMonthlySends: 1000,
      });

      mockPrismaService.usageCounter.findUnique.mockResolvedValue({
        usage: 900,
      });

      const result = await service.checkQuota(
        'tenant123',
        UsageType.MonthlySends,
        100,
      );

      expect(result.allowed).toBe(true);
      expect(result.current).toBe(900);
      expect(result.limit).toBe(1000);
    });

    it('should block when usage + requested exceeds limit', async () => {
      mockPlanTierService.getPlanLimits.mockResolvedValue({
        maxMonthlySends: 1000,
      });

      mockPrismaService.usageCounter.findUnique.mockResolvedValue({
        usage: 950,
      });

      const result = await service.checkQuota(
        'tenant123',
        UsageType.MonthlySends,
        100,
      );

      expect(result.allowed).toBe(false);
      expect(result.current).toBe(950);
      expect(result.limit).toBe(1000);
    });

    it('should block when already at limit', async () => {
      mockPlanTierService.getPlanLimits.mockResolvedValue({
        maxMonthlySends: 1000,
      });

      mockPrismaService.usageCounter.findUnique.mockResolvedValue({
        usage: 1000,
      });

      const result = await service.checkQuota(
        'tenant123',
        UsageType.MonthlySends,
        1,
      );

      expect(result.allowed).toBe(false);
    });

    it('should create counter if not exists', async () => {
      mockPlanTierService.getPlanLimits.mockResolvedValue({
        maxMonthlySends: 1000,
      });

      mockPrismaService.usageCounter.findUnique.mockResolvedValue(null);
      mockPrismaService.usageCounter.create.mockResolvedValue({
        usage: 0,
      });

      const result = await service.checkQuota(
        'tenant123',
        UsageType.MonthlySends,
        100,
      );

      expect(result.allowed).toBe(true);
      expect(mockPrismaService.usageCounter.create).toHaveBeenCalled();
    });
  });

  describe('incrementUsage', () => {
    it('should increment usage counter', async () => {
      mockPrismaService.usageCounter.findUnique.mockResolvedValue({
        id: 'counter123',
        usage: 100,
      });

      mockPrismaService.usageCounter.update.mockResolvedValue({
        id: 'counter123',
        usage: 150,
      });

      const result = await service.incrementUsage(
        'tenant123',
        UsageType.MonthlySends,
        50,
      );

      expect(result.usage).toBe(150);
      expect(mockPrismaService.usageCounter.update).toHaveBeenCalledWith({
        where: { id: 'counter123' },
        data: { usage: 150 },
      });
    });

    it('should create counter if not exists before increment', async () => {
      mockPrismaService.usageCounter.findUnique.mockResolvedValue(null);
      mockPrismaService.usageCounter.create.mockResolvedValue({
        id: 'counter123',
        usage: 50,
      });

      const result = await service.incrementUsage(
        'tenant123',
        UsageType.MonthlySends,
        50,
      );

      expect(mockPrismaService.usageCounter.create).toHaveBeenCalled();
    });
  });

  describe('getUsage', () => {
    it('should return usage with percentage', async () => {
      mockPlanTierService.getPlanLimits.mockResolvedValue({
        maxMonthlySends: 1000,
      });

      mockPrismaService.usageCounter.findUnique.mockResolvedValue({
        usage: 500,
      });

      const result = await service.getUsage('tenant123', UsageType.MonthlySends);

      expect(result.current).toBe(500);
      expect(result.limit).toBe(1000);
      expect(result.percentage).toBe(50);
    });

    it('should handle zero limit', async () => {
      mockPlanTierService.getPlanLimits.mockResolvedValue({
        maxAiTokens: 0,
      });

      mockPrismaService.usageCounter.findUnique.mockResolvedValue({
        usage: 0,
      });

      const result = await service.getUsage('tenant123', UsageType.AiTokens);

      expect(result.limit).toBe(0);
      expect(result.percentage).toBe(0);
    });
  });

  describe('getAllUsage', () => {
    it('should return both sends and tokens usage', async () => {
      mockPlanTierService.getPlanLimits.mockResolvedValue({
        maxMonthlySends: 1000,
        maxAiTokens: 500,
      });

      mockPrismaService.usageCounter.findUnique
        .mockResolvedValueOnce({ usage: 100 }) // monthly sends
        .mockResolvedValueOnce({ usage: 50 }); // ai tokens

      const result = await service.getAllUsage('tenant123');

      expect(result).toHaveProperty('monthlySends');
      expect(result).toHaveProperty('aiTokens');
      expect(result.monthlySends.current).toBe(100);
      expect(result.aiTokens.current).toBe(50);
    });
  });

  describe('getUsageHistory', () => {
    it('should retrieve historical usage', async () => {
      const pastMonth = startOfMonth(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
      const futureDate = endOfMonth(pastMonth);

      mockPrismaService.usageCounter.findUnique.mockResolvedValue({
        usage: 500,
        periodStart: pastMonth,
      });

      const result = await service.getUsageHistory('tenant123', UsageType.MonthlySends, pastMonth);

      expect(result).toBeDefined();
    });
  });
});
