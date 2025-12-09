export interface ApiAuthResponse {
  user: { id: string; email: string; lastUsedTenantId: string };
  tenant: { id: string; name: string };
  tokens: { accessToken: string; refreshToken: string };
}

// Align with configured API host so we always hit the Nest backend. Default to localhost:3000 where the API runs.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function postAuth(
  path: '/auth/signup' | '/auth/login',
  payload: Record<string, unknown>,
): Promise<ApiAuthResponse> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.error?.message || 'Something went wrong');
  }

  return body.data as ApiAuthResponse;
}

export function persistSession(tokens: ApiAuthResponse['tokens'], tenantId: string) {
  // Store tenant context; access token expected to be httpOnly/secure from the API in production.
  const cookieBase = '; path=/; SameSite=Lax';
  document.cookie = `tenant_id=${tenantId}${cookieBase}`;
}
