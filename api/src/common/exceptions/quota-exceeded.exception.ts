import { HttpException, HttpStatus } from '@nestjs/common';

export class QuotaExceededException extends HttpException {
  constructor(
    public current: number,
    public limit: number,
    public usageType: string,
  ) {
    super(
      {
        statusCode: HttpStatus.PAYMENT_REQUIRED,
        message: `Quota exceeded: ${current}/${limit} ${usageType} used`,
        error: 'QUOTA_EXCEEDED',
        current,
        limit,
        usageType,
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}
