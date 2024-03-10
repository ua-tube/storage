import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AuthInternalGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  public async canActivate(ctx: ExecutionContext): Promise<boolean> | never {
    const req: Request = ctx.switchToHttp().getRequest();
    return (
      req.headers.token === this.configService.get<string>('SERVICE_TOKEN')
    );
  }
}
