import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { isEmpty } from 'class-validator';
import { TokenService } from '../../storage/services';

@Injectable()
export class AuthImageUploadTokenGuard implements CanActivate {
  private readonly validCategories = [
    'user-uploaded-thumbnail',
    'user-uploaded-banner',
  ];

  constructor(private readonly tokenService: TokenService) {}

  public async canActivate(ctx: ExecutionContext): Promise<boolean> | never {
    const req = ctx.switchToHttp().getRequest();

    const token = req.query.token as string;

    if (isEmpty(token)) {
      throw new UnauthorizedException('No upload token provided');
    }

    const payload = await this.tokenService.verifyAsync<{
      category?: string;
      userId?: string;
      imageId?: string;
    }>(token, 'IMAGE');

    if (!this.validCategories.includes(payload.category)) {
      throw new BadRequestException('Upload token is malformed');
    }

    req.imageUploadTokenInfo = {
      userId: payload?.userId,
      category: payload?.category,
      imageId: payload?.imageId,
    };

    return true;
  }
}
