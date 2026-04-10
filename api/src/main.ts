import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Only allow defined properties in DTOs
    forbidNonWhitelisted: true, // Throw an error if extraneous properties are provided
  }));

  app.enableCors(); // Allow requests from our frontend
  await app.listen(process.env.PORT ?? 4000); // 4000 to match api.client.ts
}
bootstrap();
