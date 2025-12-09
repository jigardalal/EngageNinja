import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { AuthContext } from '../auth.types';

/**
 * Guard to enforce active tenant requirement on tenant-scoped endpoints.
 * Skips validation for:
 * - Unauthenticated requests (handled by JwtAuthGuard)
 * - Routes marked with @SkipActiveTenantCheck()
 * - Auth endpoints (/auth/*)
 * - Health/public endpoints
 */
@Injectable()
export class ActiveTenantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authRequest = request as Request & { user?: AuthContext };

    // Skip auth endpoints
    if (request.path.startsWith('/auth/')) {
      return true;
    }

    // Check for explicit skip marker
    const skipCheck = this.reflector.get<boolean>(
      'skipActiveTenantCheck',
      context.getHandler(),
    );
    if (skipCheck) {
      return true;
    }

    // If user is not authenticated, let JwtAuthGuard handle it
    if (!authRequest.user) {
      return true;
    }

    // Validate activeTenantId exists for authenticated requests to tenant-scoped endpoints
    const activeTenantId = authRequest.user?.activeTenantId;
    if (!activeTenantId) {
      throw new HttpException(
        {
          code: 'ACTIVE_TENANT_REQUIRED',
          message:
            'Active tenant context is required for this operation. Choose or create a tenant to continue.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return true;
  }
}
