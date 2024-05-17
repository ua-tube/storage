import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { File, FileStatus } from '@prisma/client';
import { ClientRMQ } from '@nestjs/microservices';
import {
  VIDEO_MANAGER_SERVICE,
  VIDEO_PROCESSOR_SERVICE,
} from '../../common/constants';
import { VideoUploadedEvent } from '../../common/events';
import { TServiceUploadInfo } from '../../common/types';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class VideoStorageService implements OnApplicationBootstrap {
  private readonly logger = new Logger(VideoStorageService.name);

  constructor(
    @Inject(VIDEO_PROCESSOR_SERVICE)
    private readonly videoProcessorClient: ClientRMQ,
    @Inject(VIDEO_MANAGER_SERVICE)
    private readonly videoManagerClient: ClientRMQ,
    private readonly prisma: PrismaService,
  ) {}

  onApplicationBootstrap() {
    this.videoProcessorClient
      .connect()
      .then(() =>
        this.logger.log(
          `${VIDEO_PROCESSOR_SERVICE} connection established`,
        ),
      )
      .catch(() =>
        this.logger.error(
          `${VIDEO_PROCESSOR_SERVICE} connection failed`,
        ),
      );
    this.videoManagerClient
      .connect()
      .then(() =>
        this.logger.log(
          `${VIDEO_MANAGER_SERVICE} connection established`,
        ),
      )
      .catch(() =>
        this.logger.error(
          `${VIDEO_MANAGER_SERVICE} connection failed`,
        ),
      );
  }

  async userUploadVideo(info: any, file: Express.Multer.File) {
    const video = await this.prisma.file.create({
      data: {
        id: info.videoId,
        groupId: info.videoId,
        userId: info.creatorId,
        category: info.category,
        filename: file.filename,
        fileSize: BigInt(file.size),
        originalFileName: file.originalname,
        url: `/videos/${info.category}/${info.videoId}/${file.filename}`,
      },
    });

    this.logger.log(
      `Video file (${video.id}) is uploaded from user (${video.userId})`,
    );

    await lastValueFrom(
      this.videoManagerClient.send('set_processing_status', {
        videoId: video.id,
        status: 'VideoUploaded',
      }),
    );
    this.videoProcessorClient.emit(
      'process_video',
      new VideoUploadedEvent(
        video.id,
        video.userId,
        video.originalFileName,
        video.url,
      ),
    );
    this.logger.log(`Video file (${video.id}) is sent to process service`);
    return this.trackVideo(video);
  }

  async serviceUploadVideo(
    info: TServiceUploadInfo,
    file: Express.Multer.File,
  ) {
    const video = await this.prisma.file.create({
      data: {
        id: info.fileId,
        groupId: info.groupId,
        category: info.category,
        filename: file.filename,
        fileSize: BigInt(file.size),
        originalFileName: file.originalname,
        url: `/videos/${info.category}/${info.groupId}/${file.filename}`,
      },
    });

    this.logger.log(`Video file (${video.id}) is uploaded from service`);
    return this.trackVideo(video);
  }

  private async trackVideo(file: File) {
    const tracking = await this.prisma.fileTracking.create({
      data: {
        fileId: file.id,
        status: FileStatus.InUse,
      },
    });
    this.logger.log(
      `Video file (${file.id}) tracking started (${tracking.id})`,
    );

    return file;
  }
}
