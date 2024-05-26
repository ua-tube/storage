import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { File, FileStatus } from '@prisma/client';
import { TServiceUploadInfo } from '../../common/types';
import { TokenService } from './token.service';

@Injectable()
export class ImageStorageService {
  private readonly logger = new Logger(ImageStorageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async userUploadImage(info: any, file: Express.Multer.File) {
    const image = await this.prisma.file.create({
      data: {
        id: info.imageId,
        groupId: info.imageId,
        category: info.category,
        filename: file.filename,
        fileSize: BigInt(file.size),
        userId: info.userId,
        originalFileName: file.originalname,
        url: `/images/${info.category}/${info.imageId}/${file.filename}`,
      },
    });
    this.logger.log(
      `Image file (${image.id}) is uploaded from user (${image.userId})`,
    );

    await this.trackImage(image);

    return {
      ...image,
      token: await this.tokenService.signAsync(
        {
          fileId: image.id,
          fileName: image.filename,
          fileSize: String(image.fileSize),
          url: image.url,
          category: image.category,
          userId: image.userId,
        },
        'IMAGE',
      ),
    };
  }

  async serviceUploadImage(
    info: TServiceUploadInfo,
    file: Express.Multer.File,
  ) {
    const image = await this.prisma.file.create({
      data: {
        id: info.fileId,
        groupId: info.groupId,
        category: info.category,
        filename: file.filename,
        fileSize: BigInt(file.size),
        originalFileName: file.originalname,
        url: `/images/${info.category}/${info.groupId}/${file.filename}`,
      },
    });
    this.logger.log(`Image file (${image.id}) is uploaded from service`);
    await this.trackImage(image);
    return image;
  }

  private async trackImage(file: File) {
    const tracking = await this.prisma.fileTracking.create({
      data: {
        fileId: file.id,
        status: FileStatus.InUse,
      },
    });
    this.logger.log(
      `Image file (${file.id}) tracking started (${tracking.id})`,
    );
  }
}
