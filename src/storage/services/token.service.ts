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
        issuer: this.configService.get<string>(`JWT_${issuer}_UT_ISSUER`),
      });
    } catch {
      throw new UnauthorizedException('Failed to validate upload token');
    }
  }

  async signAsync(payload: any, issuer: 'IMAGE' | 'VIDEO') {
    try {
      return await this.jwtService.signAsync(payload, {
        issuer: this.configService.get<string>(`JWT_${issuer}_UT_ISSUER`),
      });
    } catch {
      return null;
    }
  }
}
