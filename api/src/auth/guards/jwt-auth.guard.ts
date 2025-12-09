import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthContext } from '../auth.types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(
    err: unknown,
    user: AuthContext | false,
    _info: unknown,
    context: ExecutionContext,
  ): any {
    if (err || !user) {
      throw new HttpException(
        { code: 'AUTH_UNAUTHORIZED', message: 'Unauthorized' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const req = context.switchToHttp().getRequest<{ user: AuthContext }>();

    req.user = user;
    return user;
  }
}
