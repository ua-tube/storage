import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { videoMimetypes } from '../constants';

export const multerUserVideoInterceptor = FileInterceptor('file', {
  storage: diskStorage({
    destination: async (req: any, _, callback) => {
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
    filename: (_, file, callback) => {
      callback(null, `${randomUUID()}${extname(file.originalname)}`);
    },
  }),
  fileFilter(_, file, callback) {
    if (!videoMimetypes.includes(file.mimetype)) {
      return callback(
        new BadRequestException('invalid file type provided'),
        false,
      );
    }
    callback(null, true);
  },
});
