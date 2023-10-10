import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { S3Module } from 'nestjs-s3';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadModule } from './upload/upload.module';
import { TransformInterceptor } from './utils/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UploadModule,
    S3Module.forRoot({
      config: {
        credentials: {
          accessKeyId: process.env.AWS_S3_ACCESS_KEY,
          secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
        },
        endpoint: process.env.AWS_S3_ENDPOINT,
        forcePathStyle: true,
        region: process.env.AWS_S3_REGION
        // signatureVersion: 'v4',
      },
    }),

  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule { }
