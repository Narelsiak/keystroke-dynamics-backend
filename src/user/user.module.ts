import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { KeystrokeModule } from 'src/keystroke/keystroke.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), KeystrokeModule],
  providers: [UserService], // <-- DODAJ TUTAJ
  exports: [UserService], // (opcjonalnie, jeśli chcesz używać UserService w innych modułach)
  controllers: [UserController],
})
export class UserModule {}
