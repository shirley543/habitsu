import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { EnvService } from './env/env.service';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000', // FE origin TODOs change to environment variable
    credentials: true,
  });

  // Middleware for parsing cookies in header e.g.
  // JWT token for auth
  // Future work:
  // - investigate CSRF tokens to protect sensitive requests (POST, PUT, DELETE, etc)
  // - investigate session-based auth, over current JWT in cookie auth (harder token revocation/ invalidation, as lasts until expiry)
  // - expand on current JWT in cookie auth, with refresh tokens (decrease JWT token expiry to ~10mins, refresh ~1 week?)
  app.use(cookieParser());
  
  const config = new DocumentBuilder()
    .setTitle('Median')
    .setDescription('The Median API description')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(8080);
}
bootstrap();