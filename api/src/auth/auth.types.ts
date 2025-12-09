export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

import { PlanTier } from '../common/enums/plan-tier.enum';

export interface AuthUser {
  id: string;
  email: string;
  lastUsedTenantId: string;
  planTier: PlanTier;
}

export interface AuthTenantSettings {
  planTier: PlanTier;
  region: string;
  capabilityFlags: string[];
}

export interface AuthTenant {
  id: string;
  name: string;
  settings?: AuthTenantSettings | null;
}

export interface AuthResult {
  user: AuthUser;
  tenant: AuthTenant;
  tokens: AuthTokens;
}

export interface AuthContext {
  userId: string;
  email: string;
  tenantId: string;
  activeTenantId: string;
  planTier: PlanTier;
  capabilityFlags: string[];
  tenantRegion?: string;
  planQuota: number;
}
