import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to skip ActiveTenantGuard validation on specific endpoints.
 * Use when an endpoint should be accessible without an active tenant.
 * Example: /auth/switch-tenant, /tenants (list - can be called to select first tenant)
 */
export const SkipActiveTenantCheck = () =>
  SetMetadata('skipActiveTenantCheck', true);
