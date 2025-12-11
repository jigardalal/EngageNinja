import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from '../../prisma/prisma.module';
import { CommonModule } from '../../common/common.module';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { TenantApiKeysModule } from './tenant-api-keys/tenant-api-keys.module';

@Module({
  imports: [ConfigModule, PrismaModule, CommonModule, TenantApiKeysModule],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService, TenantApiKeysModule],
})
export class TenantsModule {}
