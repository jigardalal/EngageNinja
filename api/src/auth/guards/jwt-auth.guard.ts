import { ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: unknown, user: any, _info: unknown, context: ExecutionContext) {
    if (err || !user) {
      throw new HttpException(
        { code: 'AUTH_UNAUTHORIZED', message: 'Unauthorized' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const req = context.switchToHttp().getRequest();
    req.user = user;
    return user;
  }
}
