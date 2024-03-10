import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { mkdir } from 'fs/promises';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { imageMimetypes } from '../constants';
import { randomUUID } from 'crypto';

export const multerImageInterceptor = FileInterceptor('file', {
  storage: diskStorage({
    destination: async (req, file, callback) => {
      const videosFolderPath = join(
        process.cwd(),
        'public',
        'images',
        req.res.locals.imageUploadTokenInfo.category,
        req.res.locals.imageUploadTokenInfo.imageId,
      );
      await mkdir(videosFolderPath, { recursive: true });
      callback(null, videosFolderPath);
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
