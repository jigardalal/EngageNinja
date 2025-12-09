export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  lastUsedTenantId: string;
}

export interface AuthTenant {
  id: string;
  name: string;
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
}
