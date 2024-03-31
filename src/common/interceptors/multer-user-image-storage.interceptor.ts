import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { mkdir } from 'fs/promises';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { imageMimetypes } from '../constants';
import { randomUUID } from 'crypto';

export const multerUserImageInterceptor = FileInterceptor('file', {
  storage: diskStorage({
    destination: async (req, file, callback) => {
      const imagesFolderPath = join(
        process.cwd(),
        'public',
        'images',
        req.res.locals.imageUploadTokenInfo.category,
        req.res.locals.imageUploadTokenInfo.imageId,
      );
      await mkdir(imagesFolderPath, { recursive: true });
      callback(null, imagesFolderPath);
    },
    filename: (req, file, callback) => {
      callback(null, `${randomUUID()}${extname(file.originalname)}`);
    },
  }),
  fileFilter(req, file, callback) {
    if (!imageMimetypes.includes(file.mimetype)) {
      return callback(
        new BadRequestException('invalid file type provided'),
        false,
      );
    }

    callback(null, true);
  },
});
