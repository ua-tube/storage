import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { mkdir } from 'node:fs/promises';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { imageMimetypes } from '../constants';
import { randomUUID } from 'node:crypto';

export const multerUserImageInterceptor = FileInterceptor('file', {
  storage: diskStorage({
    destination: async (req: any, _, callback) => {
      const imagesFolderPath = join(
        process.cwd(),
        'public',
        'images',
        req.imageUploadTokenInfo.category,
        req.imageUploadTokenInfo.imageId,
      );
      await mkdir(imagesFolderPath, { recursive: true });
      callback(null, imagesFolderPath);
    },
    filename: (_, file, callback) => {
      callback(null, `${randomUUID()}${extname(file.originalname)}`);
    },
  }),
  fileFilter(_, file, callback) {
    if (!imageMimetypes.includes(file.mimetype)) {
      return callback(
        new BadRequestException('invalid file type provided'),
        false,
      );
    }

    callback(null, true);
  },
});
