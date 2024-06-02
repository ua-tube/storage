import {
  BadRequestException,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  AuthInternalGuard,
  AuthUserGuard,
  AuthVideoUploadTokenGuard,
} from '../../common/guards';
import {
  multerServiceHlsMasterInterceptor,
  multerServiceHlsSegmentsInterceptor,
  multerUserVideoInterceptor,
} from '../../common/interceptors';
import { VideoStorageService } from '../services';
import { VideoUploadTokenInfo } from '../../common/decorators';

@Controller('storage/videos')
export class VideoStorageController {
  constructor(private readonly videoStorageService: VideoStorageService) {}

  @HttpCode(200)
  @UseGuards(AuthUserGuard, AuthVideoUploadTokenGuard)
  @UseInterceptors(multerUserVideoInterceptor)
  @Post()
  async userUploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @VideoUploadTokenInfo() info: any,
  ) {
    if (!file) {
      throw new BadRequestException('no file provided');
    }

    const video = await this.videoStorageService.userUploadVideo(info, file);
    return {
      ...video,
      fileSize: video.fileSize.toString(),
    };
  }

  @HttpCode(200)
  @UseGuards(AuthInternalGuard)
  @UseInterceptors(multerServiceHlsMasterInterceptor)
  @Post('internal/hls/master')
  async serviceUploadVideoHlsMaster(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('no file provided');
    }

    return { filename: file.filename };
  }

  @HttpCode(200)
  @UseGuards(AuthInternalGuard)
  @UseInterceptors(multerServiceHlsSegmentsInterceptor)
  @Post('internal/hls/segments')
  async serviceUploadVideoHlsSegments(
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files) {
      throw new BadRequestException('no files provided');
    }

    return files.map((file) => ({ filename: file.filename }));
  }
}
