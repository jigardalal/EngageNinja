import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { QuotaResetCron } from './quota-reset.cron';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [ScheduleModule.forRoot(), CommonModule],
  providers: [QuotaResetCron],
})
export class CronModule {}
