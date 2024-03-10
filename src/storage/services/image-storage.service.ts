import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { FileStatus } from '@prisma/client';

@Injectable()
export class ImageStorageService {
  private readonly logger = new Logger(ImageStorageService.name);

  constructor(private readonly prisma: PrismaService) {}

  async userUploadImage(info: any, file: Express.Multer.File) {
    const image = await this.prisma.file.create({
      data: {
        id: info.imageId,
        groupId: info.imageId,
        category: info.category,
        filename: file.filename,
        userId: info.userId,
        originalFileName: file.originalname,
        url: `/images/${info.category}/${info.imageId}/${file.filename}`,
      },
    });

    this.logger.log(
      `Image file (${image.id}) is uploaded from user (${image.userId})`,
    );
    const tracking = await this.prisma.fileTracking.create({
      data: {
        fileId: image.id,
        status: FileStatus.InUse,
      },
    });
    this.logger.log(
      `Video file (${image.id}) tracking started (${tracking.id})`,
    );

    return image;
  }

  async serviceUploadImage() {}
}
