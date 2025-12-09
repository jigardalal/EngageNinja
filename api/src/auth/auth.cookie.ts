import { Response } from 'express';

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
  tenantId: string,
) {
  const baseCookie = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };

  res.cookie('access_token', tokens.accessToken, baseCookie);
  res.cookie('refresh_token', tokens.refreshToken, baseCookie);
  // Tenant ID is also httpOnly for security; rely on JWT claim for client-side access
  res.cookie('tenant_id', tenantId, baseCookie);
}
