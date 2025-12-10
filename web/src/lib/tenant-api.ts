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
  const response = await fetchJson<{ user: AuthSession }>('/auth/me', {
    method: 'GET',
  });
  return response.user;
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
