import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
import { UsersController } from './controllers/users.controller';
import { KeystrokeModule } from 'src/modules/keystroke/keystroke.module';
import { SecretWord } from './entities/secret-word.entity';
import { grpcController } from './controllers/grpc.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthController } from './controllers/auth.controller';
import { UserProfileController } from './controllers/user-profile.controller';
import { ModelController } from './controllers/model.controller';
import { SecretWordController } from './controllers/secret-word.controller';

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

  controllers: [
    UsersController,
    AuthController,
    grpcController,
    UserProfileController,
    ModelController,
    SecretWordController,
  ],
})
export class UserModule {}
