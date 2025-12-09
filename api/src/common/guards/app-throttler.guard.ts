import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  // Framework (ThrottlerGuard) requires this method to be async, even though
  // we don't actually need to await anything. Throwing immediately is correct.
  // eslint-disable-next-line @typescript-eslint/require-await
  protected async throwThrottlingException(
    _context: ExecutionContext,
    _throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    void _context;
    void _throttlerLimitDetail;
    throw new HttpException(
      {
        code: 'AUTH_RATE_LIMITED',
        message: 'Too many requests',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
