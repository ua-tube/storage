import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { mkdir } from 'node:fs/promises';
import { diskStorage } from 'multer';
import { join } from 'node:path';
import { extname } from 'node:path';

export const multerServiceHlsMasterInterceptor = FileInterceptor('file', {
  storage: diskStorage({
    destination: async (req, _, callback) => {
      if (!req.headers?.category || !req.headers?.['group-id']) {
        return callback(new BadRequestException(), null);
      }

      const hlsMasterFolderPath = join(
        process.cwd(),
        'public',
        'videos',
        req.headers.category as string,
        req.headers['group-id'] as string,
        (req.headers?.['hls-id'] as string) || '',
      );

      await mkdir(hlsMasterFolderPath, { recursive: true });
      callback(null, hlsMasterFolderPath);
    },
    filename(_, file, callback) {
      callback(null, file.originalname);
    },
  }),
  fileFilter(_, file, callback) {
    if (extname(file.originalname) !== '.m3u8') {
      return callback(
        new BadRequestException('invalid file type provided'),
        false,
      );
    }

    callback(null, true);
  },
});
