import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { FileStatus } from '@prisma/client';
import { ClientRMQ } from '@nestjs/microservices';
import { VIDEO_PROCESSOR_SERVICE } from '../../common/constants';
import { VideoUploadedEvent } from '../../common/events';

@Injectable()
export class VideoStorageService implements OnApplicationBootstrap {
  private readonly logger = new Logger(VideoStorageService.name);

  constructor(
    @Inject(VIDEO_PROCESSOR_SERVICE)
    private readonly client: ClientRMQ,
    private readonly prisma: PrismaService,
  ) {}

  onApplicationBootstrap() {
    this.client
      .connect()
      .then(() => this.logger.log('RabbitMQ connection established'))
      .catch(() => this.logger.error('RabbitMQ connection failed'));
  }

  async userUploadVideo(info: any, file: Express.Multer.File) {
    const video = await this.prisma.file.create({
      data: {
        id: info.videoId,
        groupId: info.videoId,
        userId: info.creatorId,
        category: info.category,
        filename: file.filename,
        originalFileName: file.originalname,
        url: `/videos/${info.category}/${info.videoId}/${file.filename}`,
      },
    });

    this.logger.log(
      `Video file (${video.id}) is uploaded from user (${video.userId})`,
    );

    this.client.emit(
      'process_video',
      new VideoUploadedEvent(
        video.id,
        video.userId,
        video.originalFileName,
        video.url,
      ),
    );
    this.logger.log(`Video file (${video.id}) is sent to process service`);

    const tracking = await this.prisma.fileTracking.create({
      data: {
        fileId: video.id,
        status: FileStatus.InUse,
      },
    });
    this.logger.log(
      `Video file (${video.id}) tracking started (${tracking.id})`,
    );

    return video;
  }

  async serviceUploadVideo() {}
}
