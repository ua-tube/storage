import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ImageUploadTokenInfo = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    return context.switchToHttp().getRequest().imageUploadTokenInfo;
  },
);
