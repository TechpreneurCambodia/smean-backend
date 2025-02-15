import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from "dotenv";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS Cross Origin Resource Saharing
  app.enableCors({
    origin: 'http://localhost:3001', // Frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Luyknhom API Documentation')
    .setDescription('Forsdfds API information')
    .setVersion('1.0')
    .addTag('money')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/doc', app, documentFactory);
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await process.env.REFRESH_SECRET}`);
}
bootstrap();
