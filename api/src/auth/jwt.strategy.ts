import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { Request } from 'express';

import { AuthContext } from './auth.types';

function cookieExtractor(req: Request): string | null {
  const token = req?.cookies?.access_token as string | undefined;
  return typeof token === 'string' ? token : null;
}

interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  activeTenantId: string;
  planTier: string;
  capabilityFlags?: string[];
  tenantRegion?: string;
  planQuota?: number;
}

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'dev-secret-access',
    };
    super(options);
  }

  validate(payload: JwtPayload): AuthContext {
    const authContext: AuthContext = {
      userId: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
      activeTenantId: payload.activeTenantId ?? payload.tenantId,
      planTier: payload.planTier,
      capabilityFlags: payload.capabilityFlags ?? [],
      tenantRegion: payload.tenantRegion,
      planQuota: payload.planQuota ?? 0,
    };

    return authContext;
  }
}
