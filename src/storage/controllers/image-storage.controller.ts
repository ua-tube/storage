import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  AuthImageUploadTokenGuard,
  AuthInternalGuard,
  AuthUserGuard,
} from '../../common/guards';
import {
  multerServiceImageInterceptor,
  multerUserImageInterceptor,
} from '../../common/interceptors';
import { ImageStorageService } from '../services';
import {
  ImageUploadTokenInfo,
  ServiceUploadInfo,
} from '../../common/decorators';
import { TServiceUploadInfo } from '../../common/types';

@Controller('storage/images')
export class ImageStorageController {
  constructor(private readonly imageStorageService: ImageStorageService) {}

  @UseGuards(AuthUserGuard, AuthImageUploadTokenGuard)
  @UseInterceptors(multerUserImageInterceptor)
  @Post()
  async userUploadImage(
    @UploadedFile() file: Express.Multer.File,
    @ImageUploadTokenInfo() info: any,
  ) {
    if (!file) {
      throw new BadRequestException('no file provided');
    }

    return this.imageStorageService.userUploadImage(info, file);
  }

  @UseGuards(AuthInternalGuard)
  @UseInterceptors(multerServiceImageInterceptor)
  @Post('internal')
  async serviceUploadImage(
    @UploadedFile() file: Express.Multer.File,
    @ServiceUploadInfo() info: TServiceUploadInfo,
  ) {
    if (!file) {
      throw new BadRequestException('no file provided');
    }

    return this.imageStorageService.serviceUploadImage(info, file);
  }
}
