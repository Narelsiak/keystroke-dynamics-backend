import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'keystroke-dynamics',
      entities: [User], // Tablica Twoich encji
      synchronize: true, // Tylko w development! W produkcji ustaw na false
      migrations: ['src/migrations/*.ts'],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
