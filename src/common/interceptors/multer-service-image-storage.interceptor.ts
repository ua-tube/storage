import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { mkdir } from 'fs/promises';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { imageMimetypes } from '../constants';

export const multerServiceImageInterceptor = FileInterceptor('file', {
  storage: diskStorage({
    destination: async (req, file, callback) => {
      if (!req.headers.category || !req.headers['group-id']) {
        return callback(new BadRequestException(), null);
      }

      const imagesFolderPath = join(
        process.cwd(),
        'public',
        'images',
        req.headers.category as string,
        req.headers['group-id'] as string,
      );
      await mkdir(imagesFolderPath, { recursive: true });
      callback(null, imagesFolderPath);
    },
    filename: (req, file, callback) => {
      callback(null, `${req.headers['file-id']}${extname(file.originalname)}`);
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
