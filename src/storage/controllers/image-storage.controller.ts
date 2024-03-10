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
import { multerImageInterceptor } from '../../common/interceptors';
import { ImageStorageService } from '../services';
import { ImageUploadTokenInfo } from '../../common/decorators';

@UseInterceptors(multerImageInterceptor)
@Controller('storage/images')
export class ImageStorageController {
  constructor(private readonly imageStorageService: ImageStorageService) {}

  @UseGuards(AuthUserGuard, AuthImageUploadTokenGuard)
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
  @Post('internal')
  async serviceUploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('no file provided');
    }

    return this.imageStorageService.serviceUploadImage();
  }
}
