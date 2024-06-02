import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async verifyAsync<T extends object>(
    token: string,
    issuer: 'IMAGE' | 'VIDEO',
  ): Promise<T> {
    try {
      return await this.jwtService.verifyAsync<T>(token, {
        subject: 'upload-token',
        secret: this.configService.get<string>('JWT_SECRET'),
        audience: this.configService.get<string>('JWT_AUDIENCE'),
        issuer: this.configService.get<string>(`JWT_${issuer}_UT_ISSUER`),
        ignoreExpiration: false,
      });
    } catch {
      throw new UnauthorizedException('Failed to validate upload token');
    }
  }

  async signImageTokenAsync(payload: any) {
    try {
      return await this.jwtService.signAsync(payload, {
        subject: 'upload-token',
        secret: this.configService.get<string>('JWT_SECRET'),
        audience: this.configService.get<string>('JWT_AUDIENCE'),
        issuer: this.configService.get<string>(`JWT_IMAGE_UT_ISSUER`),
        expiresIn: '5m',
      });
    } catch {
      return null;
    }
  }
}
