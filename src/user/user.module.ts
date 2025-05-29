import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { KeystrokeModule } from 'src/keystroke/keystroke.module';
import { SecretWord } from './entities/secret-word.entity';
import { grpcController } from './controllers/grpc.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, SecretWord]),
    KeystrokeModule,
    ClientsModule.register([
      {
        name: 'KEYSTROKE_PACKAGE',

        transport: Transport.GRPC,
        options: {
          package: 'keystroke',
          protoPath: join(__dirname, '../../proto/keystroke.proto'),
          url: 'localhost:50051',
          loader: {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
          },
        },
      },
    ]),
  ],
  providers: [UserService], // <-- DODAJ TUTAJ
  exports: [UserService], // (opcjonalnie, jeśli chcesz używać UserService w innych modułach)

  controllers: [UserController, grpcController], // <-- DODAJ TUTAJ
})
export class UserModule {}
