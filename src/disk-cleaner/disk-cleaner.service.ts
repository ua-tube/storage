import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { join } from 'node:path';
import { rm } from 'node:fs/promises';

@Injectable()
export class DiskCleanerService {
  private readonly logger = new Logger(DiskCleanerService.name);

  constructor(private readonly prisma: PrismaService) {}

  //@Cron('*/30 * * * * *')
  private async handleCron() {
    const trackingItems = await this.prisma.fileTracking.findMany({
      where: { status: 'PendingToRemove' },
      select: { file: true },
    });

    const rootPath = join(process.cwd(), 'public');
    for (const tracking of trackingItems) {
      await rm(
        join(
          rootPath,
          tracking.file.category.startsWith('video') ? 'videos' : 'images',
          tracking.file.filename,
        ),
        { force: true },
      );
    }

    await this.prisma.file.deleteMany({
      where: { id: { in: trackingItems.map((x) => x.file.id) } },
    });

    this.logger.log('Clear disk');
  }
}
