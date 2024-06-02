import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { mkdir } from 'node:fs/promises';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { videoMimetypes } from '../constants';

export const multerServiceVideoInterceptor = FileInterceptor('file', {
  storage: diskStorage({
    destination: async (req, _, callback) => {
      if (!req.headers.category || !req.headers['group-id']) {
        return callback(new BadRequestException(), null);
      }

      const videosFolderPath = join(
        process.cwd(),
        'public',
        'videos',
        req.headers.category as string,
        req.headers['group-id'] as string,
      );
      await mkdir(videosFolderPath, { recursive: true });
      callback(null, videosFolderPath);
    },
    filename: (req, file, callback) => {
      callback(null, `${req.headers['file-id']}${extname(file.originalname)}`);
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
