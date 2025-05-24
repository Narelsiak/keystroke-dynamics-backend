import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeystrokeService } from './services/keystroke.service';
import { KeystrokeAttemptService } from './services/keystroke-attempt.service';
import { PasswordAttempt } from './entities/passwordAttempt.entity'; // popraw ścieżkę

@Module({
  imports: [
    TypeOrmModule.forFeature([PasswordAttempt]), // <-- to jest kluczowe!
  ],
  providers: [KeystrokeService, KeystrokeAttemptService],
  exports: [KeystrokeService, KeystrokeAttemptService],
})
export class KeystrokeModule {}
