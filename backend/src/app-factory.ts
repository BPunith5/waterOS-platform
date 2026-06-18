import { NestFactory } from '@nestjs/core';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('WaterOS API')
    .setDescription(
      'REST + WebSocket API for the WaterOS IoT water monitoring platform. ' +
      'Most endpoints require a Bearer JWT (obtain via POST /api/auth/login). ' +
      'The telemetry ingestion endpoint (POST /api/iot/:deviceId) authenticates via a per-device secret key passed as the `key` query parameter.',
    )
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
    .addApiKey({ type: 'apiKey', in: 'query', name: 'key' }, 'DeviceKey')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-standalone-preset.min.js',
    ],
  });

  return app;
}
