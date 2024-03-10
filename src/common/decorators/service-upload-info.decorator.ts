import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const ServiceUploadInfo = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const req: Request = context.switchToHttp().getRequest();
    return {
      fileId: req.headers['file-id'],
      groupId: req.headers['group-id'],
      category: req.headers.category,
    };
  },
);
