import { BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { mkdir } from 'node:fs/promises';
import { diskStorage } from 'multer';
import { join } from 'node:path';
import { extname } from 'node:path';

export const multerServiceHlsSegmentsInterceptor = FilesInterceptor(
  'files',
  500,
  {
    storage: diskStorage({
      destination: async (req, _, callback) => {
        if (!req.headers?.category || !req.headers?.['group-id']) {
          return callback(new BadRequestException(), null);
        }

        const hlsFolderPath = join(
          process.cwd(),
          'public',
          'videos',
          req.headers.category as string,
          req.headers['group-id'] as string,
          req.headers['hls-id'] as string,
        );
        await mkdir(hlsFolderPath, { recursive: true });
        callback(null, hlsFolderPath);
      },
      filename(_, file, callback) {
        callback(null, file.originalname);
      },
    }),
    fileFilter(_, file, callback) {
      const startsWithVideo = file.mimetype.startsWith('video');
      const extIsValid = extname(file.originalname) === '.ts';

      if (
        !startsWithVideo ||
        !extIsValid ||
        (!startsWithVideo && !extIsValid)
      ) {
        return callback(
          new BadRequestException('invalid file type provided'),
          false,
        );
      }

      callback(null, true);
    },
  },
);
