import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService], // <-- DODAJ TUTAJ
  exports: [UserService], // (opcjonalnie, jeśli chcesz używać UserService w innych modułach)
})
export class UserModule {}
