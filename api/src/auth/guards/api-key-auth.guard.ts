import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

import { TenantApiKeysService } from '../../modules/tenants/tenant-api-keys/tenant-api-keys.service';
import type { AuthContext } from '../auth.types';

/**
 * Guard to authenticate requests via API key (Bearer token in Authorization header).
 * Validates the API key secret, verifies it's active, and confirms tenant entitlement.
 * Sets user context on request for downstream handlers.
 *
 * Usage: @UseGuards(ApiKeyAuthGuard) on endpoints that should support API key auth
 */
@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(private readonly apiKeysService: TenantApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authRequest = request as Request & { user?: AuthContext };

    // Extract Bearer token from Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No API key provided - let other guards handle auth (JWT, etc.)
      return true;
    }

    const secret = authHeader.substring('Bearer '.length);

    try {
      // Extract tenantId from URL params (e.g., /tenants/:tenantId/messages/...)
      const tenantId = (request.params as Record<string, string>).tenantId;
      if (!tenantId) {
        throw new HttpException(
          {
            code: 'TENANT_ID_REQUIRED',
            message: 'Tenant ID is required in the request path.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Verify API key and get tenant context
      // Note: verifyApiKey returns null if secret is invalid or key is revoked
      const verified = await this.apiKeysService.verifyApiKey(secret, tenantId);

      if (!verified) {
        throw new HttpException(
          {
            code: 'API_KEY_INVALID_OR_REVOKED',
            message: 'API key is invalid, revoked, or does not match the tenant.',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Set user context from API key verification
      authRequest.user = {
        userId: `api-key-${verified.id}`,
        email: `api-key-${verified.name}@api`,
        tenantId: verified.tenantId,
        activeTenantId: verified.tenantId,
        planTier: verified.planTier,
        capabilityFlags: verified.scopeFlags,
        tenantRegion: undefined,
        planQuota: 0,
      } as AuthContext;

      return true;
    } catch (err) {
      // If verification fails, reject the request
      if (err instanceof HttpException) {
        throw err;
      }

      throw new HttpException(
        {
          code: 'API_KEY_VERIFICATION_FAILED',
          message: 'Failed to verify API key.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
