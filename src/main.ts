import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: 'http://localhost:3000',
      credentials: true,
    },
  });

  app.useGlobalPipes(new ValidationPipe());
  app.use(
    session({
      secret: 'secret123', // zmień na własny!
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false, // ustaw na true w produkcji z HTTPS!
        maxAge: 24 * 60 * 60 * 1000, // 1 dzień
      },
    }),
  );

  await app.listen(process.env.PORT ?? 5000);
}
void bootstrap();
