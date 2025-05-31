import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  const config = new DocumentBuilder()
    .setTitle('Biometria API')
    .setDescription('Keystroke application api')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 5000);
}
void bootstrap();
