import { PlanTier } from './tenant-plan';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const defaultHeaders = {
  'Content-Type': 'application/json',
};

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: defaultHeaders,
    ...init,
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.error?.message || 'Something went wrong.');
  }

  return body.data;
}

export interface TenantSettings {
  planTier: PlanTier;
  region: string;
  capabilityFlags: string[];
}

export interface TenantListItem {
  id: string;
  name: string;
  role: string;
  settings?: TenantSettings | null;
}

export interface AuthSession {
  userId: string;
  email: string;
  tenantId: string;
  activeTenantId: string;
  planTier: PlanTier;
  capabilityFlags: string[];
  tenantRegion?: string;
  planQuota: number;
}

export async function fetchTenants(): Promise<TenantListItem[]> {
  return fetchJson<TenantListItem[]>('/tenants');
}

export async function createTenant(payload: {
  name: string;
  planTier: PlanTier;
  region: string;
  capabilityFlags?: string[];
}): Promise<TenantListItem> {
  return fetchJson<TenantListItem>('/tenants', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function switchTenant(tenantId: string): Promise<AuthSession> {
  return fetchJson<AuthSession>('/auth/switch-tenant', {
    method: 'POST',
    body: JSON.stringify({ tenantId }),
  });
}

export async function fetchCurrentUser(): Promise<AuthSession> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: 'include',
    headers: defaultHeaders,
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.error?.message || 'Failed to fetch current user');
  }

  return body.user;
}

export enum TenantRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MARKETER = 'marketer',
  AGENCY_MARKETER = 'agency_marketer',
  VIEWER = 'viewer',
}

export interface TenantMember {
  id: string;
  email: string;
  role: TenantRole;
  status: 'pending' | 'accepted';
  createdAt: string;
  acceptedAt?: string;
}

export async function inviteTenantMember(
  tenantId: string,
  payload: { email: string; role: TenantRole; message?: string }
): Promise<TenantMember> {
  return fetchJson<TenantMember>(`/tenants/${tenantId}/members/invite`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listTenantMembers(tenantId: string): Promise<TenantMember[]> {
  return fetchJson<TenantMember[]>(`/tenants/${tenantId}/members`);
}

export async function updateMemberRole(
  tenantId: string,
  memberId: string,
  role: TenantRole
): Promise<TenantMember> {
  return fetchJson<TenantMember>(`/tenants/${tenantId}/members/${memberId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

export async function revokeMember(tenantId: string, memberId: string): Promise<void> {
  return fetchJson<void>(`/tenants/${tenantId}/members/${memberId}`, {
    method: 'DELETE',
  });
}

export interface ApiKey {
  id: string;
  name: string;
  description?: string;
  planTier: string;
  status: 'active' | 'revoked';
  lastUsedAt?: string | null;
  lastRotatedAt?: string | null;
  createdAt: string;
  lastUsed?: number | null;
}

export interface CreateApiKeyResponse {
  id: string;
  secret: string;
  name: string;
  createdAt: string;
  status: 'active';
}

export async function createApiKey(
  tenantId: string,
  payload: { name: string; description?: string; scopeFlags?: string[] }
): Promise<CreateApiKeyResponse> {
  return fetchJson<CreateApiKeyResponse>(`/tenants/${tenantId}/api-keys`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listApiKeys(tenantId: string): Promise<ApiKey[]> {
  return fetchJson<ApiKey[]>(`/tenants/${tenantId}/api-keys`);
}

export async function revokeApiKey(tenantId: string, keyId: string): Promise<{ status: string; message: string }> {
  return fetchJson<{ status: string; message: string }>(`/tenants/${tenantId}/api-keys/${keyId}`, {
    method: 'DELETE',
  });
}
