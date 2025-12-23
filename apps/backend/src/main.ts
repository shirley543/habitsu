import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000', // TODOs #31: FE origin TODOs change to environment variable
    credentials: true,
  });

  // Middleware for parsing cookies in header e.g.
  // JWT token for auth
  // Future work:
  // - [Low] Investigate CSRF tokens to protect sensitive requests (POST, PUT, DELETE), if moving to cross-domain requests
  // - [Low] Investigate session-based auth (server-stored sessions make token revocation/invalidation easier than JWT-in-cookie, which lasts until expiry)
  // - [Med] Expand on current JWT-in-cookie auth with refresh tokens:
  //     - Store access JWT in React memory
  //     - Store refresh token in HttpOnly cookie
  //     - Shorten access JWT expiry (e.g., 10 mins), refresh token expiry longer (e.g., 1 week)
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
