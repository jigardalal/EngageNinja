import { Module } from '@nestjs/common';

import { CommonModule } from '../../common/common.module';
import { TenantsModule } from '../tenants/tenants.module';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

@Module({
  imports: [CommonModule, TenantsModule],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [],
})
export class MessagesModule {}
