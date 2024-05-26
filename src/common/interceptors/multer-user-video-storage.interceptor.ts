import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { mkdir } from 'fs/promises';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { videoMimetypes } from '../constants';

export const multerUserVideoInterceptor = FileInterceptor('file', {
  storage: diskStorage({
    destination: async (req: any, file, callback) => {
      const videosFolderPath = join(
        process.cwd(),
        'public',
        'videos',
        req.videoUploadTokenInfo.category,
        req.videoUploadTokenInfo.videoId,
      );
      await mkdir(videosFolderPath, { recursive: true });
      callback(null, videosFolderPath);
    },
    filename: (req, file, callback) => {
      callback(null, `${randomUUID()}${extname(file.originalname)}`);
    },
  }),
  fileFilter(req, file, callback) {
    if (!videoMimetypes.includes(file.mimetype)) {
      return callback(
        new BadRequestException('invalid file type provided'),
        false,
      );
    }
    callback(null, true);
  },
});
