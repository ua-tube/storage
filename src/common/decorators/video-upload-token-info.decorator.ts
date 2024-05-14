import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const VideoUploadTokenInfo = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    return context.switchToHttp().getRequest().videoUploadTokenInfo;
  },
);
