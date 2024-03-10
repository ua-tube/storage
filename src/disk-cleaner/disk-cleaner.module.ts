import { Module } from '@nestjs/common';
import { DiskCleanerService } from './disk-cleaner.service';
import { PrismaModule } from '../prisma';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  providers: [DiskCleanerService],
})
export class DiskCleanerModule {}
