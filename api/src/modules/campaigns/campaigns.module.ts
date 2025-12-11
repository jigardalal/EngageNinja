import { Module } from '@nestjs/common';

import { CommonModule } from '../../common/common.module';
import { TenantsModule } from '../tenants/tenants.module';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';

@Module({
  imports: [CommonModule, TenantsModule],
  controllers: [CampaignsController],
  providers: [CampaignsService],
})
export class CampaignsModule {}
