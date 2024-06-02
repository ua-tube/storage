import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { join } from 'path';
import serveStatic from 'serve-static';
import { AppModule } from './app.module';
import { mw } from 'request-ip';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', true);

  const configService = app.get(ConfigService);
  app.enableCors({
    origin: configService.getOrThrow<string>('CLIENT_URL').split(','),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });

  app.use(helmet());
  app.use(helmet.noSniff());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.contentSecurityPolicy());
  app.use(
    helmet.crossOriginResourcePolicy({
      policy:
        configService.get('NODE_ENV') === 'development'
          ? 'cross-origin'
          : 'same-site',
    }),
  );
  app.use(mw());
  app.use('/', serveStatic(join(process.cwd(), 'public'), { maxAge: '1d' }));

  app.setGlobalPrefix('/api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableShutdownHooks();

  await app.listen(
    configService.get<number>('HTTP_PORT'),
    configService.get<string>('HTTP_HOST'),
  );
}
bootstrap();
