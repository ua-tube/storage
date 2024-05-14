import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { isEmpty } from 'class-validator';

@Injectable()
export class AuthImageUploadTokenGuard implements CanActivate {
  private readonly validCategories = [
    'user-uploaded-thumbnail',
    'user-uploaded-banner',
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  public async canActivate(ctx: ExecutionContext): Promise<boolean> | never {
    const req = ctx.switchToHttp().getRequest();

    const token = req.query.token as string;

    if (isEmpty(token)) {
      throw new UnauthorizedException('No upload token provided');
    }

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        subject: 'upload-token',
        secret: this.configService.get<string>('JWT_SECRET'),
        audience: this.configService.get<string>('JWT_AUDIENCE'),
        issuer: this.configService.get<string>('JWT_IMAGE_UT_ISSUER'),
        ignoreExpiration: false,
      });
    } catch {
      throw new UnauthorizedException('Failed to validate upload token');
    }

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
