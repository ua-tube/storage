import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma';
import { ImageStorageController, VideoStorageController } from './controllers';
import { ImageStorageService, VideoStorageService } from './services';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import {
  VIDEO_MANAGER_SERVICE,
  VIDEO_PROCESSOR_SERVICE,
} from '../common/constants';

@Module({
  imports: [
    JwtModule.register({}),
    ClientsModule.registerAsync([
      {
        name: VIDEO_MANAGER_SERVICE,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_VIDEO_MANAGER_QUEUE'),
            queueOptions: {
              durable: false,
            },
            noAck: true,
            persistent: true,
          },
        }),
      },
      {
        name: VIDEO_PROCESSOR_SERVICE,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_VIDEO_PROCESSOR_QUEUE'),
            queueOptions: {
              durable: false,
            },
            noAck: true,
            persistent: true,
          },
        }),
      },
    ]),
    PrismaModule,
  ],
  controllers: [ImageStorageController, VideoStorageController],
  providers: [ImageStorageService, VideoStorageService],
})
export class StorageModule {}
