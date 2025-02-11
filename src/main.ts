import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // OpenAPI (Swagger)
  const config = new DocumentBuilder()
    .setTitle('API de Autenticación')
    .setDescription('Endpoints para generar y verificar TOTP')
    .setVersion('1.0')
    .addServer('http://localhost:3000')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
}
bootstrap();
