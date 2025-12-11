import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../prisma/prisma.module';
import { CommonModule } from '../../../common/common.module';
import { TenantApiKeysController } from './tenant-api-keys.controller';
import { TenantApiKeysService } from './tenant-api-keys.service';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [TenantApiKeysController],
  providers: [TenantApiKeysService],
  exports: [TenantApiKeysService],
})
export class TenantApiKeysModule {}
