import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import * as fs from 'fs';
import { TransactionsModule } from './transactions/transactions.module';

async function bootstrap() {
  const imagesDir = 'img'
  if (!fs.existsSync(imagesDir)){
    fs.mkdirSync(imagesDir);
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    // disableErrorMessages: true,
  }));

  const options = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('API')
    .setDescription('API description')
    .setVersion('1.0')
    .addTag('API')
    .build();
    const document = SwaggerModule.createDocument(app, options, {
      include: [
        ProductsModule,
        CategoriesModule,
        TransactionsModule
      ],
    });
    SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
