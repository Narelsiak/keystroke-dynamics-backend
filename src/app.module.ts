import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from 'ormconfig';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [TypeOrmModule.forRoot(ormConfig), UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
