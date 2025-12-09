import { Response } from 'express';

export function setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }, tenantId: string) {
  const baseCookie = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };

  res.cookie('access_token', tokens.accessToken, baseCookie);
  res.cookie('refresh_token', tokens.refreshToken, baseCookie);
  res.cookie('tenant_id', tenantId, { ...baseCookie, httpOnly: false });
}
