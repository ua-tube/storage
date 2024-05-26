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
export class AuthVideoUploadTokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  public async canActivate(ctx: ExecutionContext): Promise<boolean> | never {
    const req = ctx.switchToHttp().getRequest();

    const token = req.query.token as string;

    if (isEmpty(token)) {
      throw new UnauthorizedException('No upload token provided');
    }

    const payload = await this.tokenService.verifyAsync<{
      category?: string;
      creatorId?: string;
      videoId?: string;
    }>(token, 'VIDEO');

    if (payload?.category !== 'user-uploaded-raw-video') {
      throw new BadRequestException('Upload token is malformed');
    }

    req.videoUploadTokenInfo = {
      creatorId: payload?.creatorId,
      category: payload?.category,
      videoId: payload?.videoId,
    };

    return true;
  }
}
