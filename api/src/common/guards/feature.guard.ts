import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthContext } from '../../auth/auth.types';
import { PlanTierService } from '../services/plan-tier.service';

export const REQUIRED_FEATURE_KEY = 'requiredFeature';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly planTierService: PlanTierService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.get<string>(REQUIRED_FEATURE_KEY, context.getHandler());

    if (!requiredFeature) {
      return true; // No feature required
    }

    const request = context.switchToHttp().getRequest<Request>();
    const authRequest = request as Request & { user?: AuthContext };

    if (!authRequest.user) {
      return true; // Let JwtAuthGuard handle authentication
    }

    const { planTier } = authRequest.user;
    const plan = await this.planTierService.getPlanLimits(planTier);

    if (!plan) {
      throw new HttpException(
        {
          code: 'FEATURE_INVALID_PLAN',
          message: 'Invalid plan tier',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (!plan.capabilityFlags.includes(requiredFeature)) {
      throw new HttpException(
        {
          code: 'FEATURE_NOT_AVAILABLE',
          message: `Feature '${requiredFeature}' is not available on your ${plan.displayName} plan. Please upgrade.`,
          requiredFeature,
          currentPlan: plan.name,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
