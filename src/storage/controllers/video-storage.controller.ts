import {
  BadRequestException,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  AuthInternalGuard,
  AuthUserGuard,
  AuthVideoUploadTokenGuard,
} from '../../common/guards';
import {
  multerServiceVideoInterceptor,
  multerUserVideoInterceptor,
} from '../../common/interceptors';
import { VideoStorageService } from '../services';
import {
  ServiceUploadInfo,
  VideoUploadTokenInfo,
} from '../../common/decorators';
import { TServiceUploadInfo } from '../../common/types';

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

    return this.videoStorageService.userUploadVideo(info, file);
  }

  @HttpCode(200)
  @UseGuards(AuthInternalGuard)
  @UseInterceptors(multerServiceVideoInterceptor)
  @Post('internal')
  async serviceUploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @ServiceUploadInfo() info: TServiceUploadInfo,
  ) {
    if (!file) {
      throw new BadRequestException('no file provided');
    }

    return this.videoStorageService.serviceUploadVideo(info, file)
  }
}
