/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { middleware } from './middleware';

function buildRequest(path: string, cookieHeader?: string) {
  return new NextRequest(`http://localhost${path}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });
}

describe('middleware auth/tenant enforcement', () => {
  it('redirects unauthenticated users hitting tenant routes to login', () => {
    const res = middleware(buildRequest('/dashboard'));
    expect(res?.status).toBe(307);
    expect(res?.headers.get('location')).toContain('/login?redirect=%2Fdashboard');
  });

  it('redirects authenticated users missing tenant context to select-tenant', () => {
    const res = middleware(buildRequest('/dashboard', 'access_token=abc'));
    expect(res?.status).toBe(307);
    expect(res?.headers.get('location')).toContain('/select-tenant');
  });

  it('allows access when both session and tenant are present', () => {
    const res = middleware(buildRequest('/dashboard', 'access_token=abc; tenant_id=ten-1'));
    expect(res?.headers.get('location')).toBeNull();
  });

  it('guards nested tenant routes (e.g., /app/tenant-page)', () => {
    const res = middleware(buildRequest('/app/tenant-page'));
    expect(res?.headers.get('location')).toContain('/login?redirect=%2Fapp%2Ftenant-page');
  });
});
