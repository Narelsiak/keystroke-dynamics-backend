import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeystrokeService } from './services/keystroke.service';
import { KeystrokeAttemptService } from './services/keystroke-attempt.service';
import { KeystrokeAttempt } from './entities/keystrokeAttempt.entity';
import { KeystrokeModelEntity } from './entities/keystrokeModel.entity';
import { KeystrokeModelService } from './services/keystroke-model.service';
import { PasswordCrackAttemptService } from './services/password-crack-attempt.service';
import { PasswordCrackAttempt } from './entities/passwordCrackAttempt.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KeystrokeAttempt,
      KeystrokeModelEntity,
      PasswordCrackAttempt,
    ]),
  ],
  providers: [
    KeystrokeService,
    KeystrokeAttemptService,
    KeystrokeModelService,
    PasswordCrackAttemptService,
  ],
  exports: [
    KeystrokeService,
    KeystrokeAttemptService,
    KeystrokeModelService,
    PasswordCrackAttemptService,
  ],
})
export class KeystrokeModule {}
