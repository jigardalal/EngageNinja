import { NextRequest, NextResponse } from 'next/server';

const AUTH_ROUTES = ['/login', '/signup'];
const TENANT_PREFIXES = ['/dashboard', '/select-tenant', '/tenant', '/app'];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get('access_token')?.value;
  const tenantId = req.cookies.get('tenant_id')?.value;
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isTenantRoute = TENANT_PREFIXES.some((route) => pathname.startsWith(route));

  if (isAuthRoute && accessToken) {
    const redirectUrl = new URL('/dashboard', req.nextUrl.origin);
    if (tenantId) {
      redirectUrl.searchParams.set('tenantId', tenantId);
    }
    return NextResponse.redirect(redirectUrl);
  }

  if (isTenantRoute) {
    if (!accessToken) {
      const loginUrl = new URL('/login', req.nextUrl.origin);
      loginUrl.searchParams.set('redirect', `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    if (!tenantId && pathname !== '/select-tenant') {
      return NextResponse.redirect(new URL('/select-tenant', req.nextUrl.origin));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
