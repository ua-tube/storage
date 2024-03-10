import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import Joi from 'joi';
import { LoggingInterceptor } from './common/interceptors';
import { StorageModule } from './storage/storage.module';
import { DiskCleanerModule } from './disk-cleaner/disk-cleaner.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.valid('development', 'production', 'test').required(),
        CLIENT_URL: Joi.string().required(),
        HTTP_HOST: Joi.string().required(),
        HTTP_PORT: Joi.number().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_IMAGE_UT_ISSUER: Joi.string().required(),
        JWT_VIDEO_UT_ISSUER: Joi.string().required(),
        JWT_AUDIENCE: Joi.string().required(),
        AUTH_SVC_URL: Joi.string().required(),
        SERVICE_TOKEN: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
        RABBITMQ_URL: Joi.string().required(),
        RABBITMQ_VIDEO_PROCESSOR_QUEUE: Joi.string().required(),
      }),
    }),
    StorageModule,
    DiskCleanerModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
