import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from '../../prisma/prisma.module';
import { CommonModule } from '../../common/common.module';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

@Module({
  imports: [ConfigModule, PrismaModule, CommonModule],
  controllers: [TenantsController],
  providers: [TenantsService],
})
export class TenantsModule {}
