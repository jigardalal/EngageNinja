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
  return fetchJson<AuthSession>('/auth/me', {
    method: 'GET',
  });
}
