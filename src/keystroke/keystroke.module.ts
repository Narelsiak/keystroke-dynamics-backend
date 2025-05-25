import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeystrokeService } from './services/keystroke.service';
import { KeystrokeAttemptService } from './services/keystroke-attempt.service';
import { KeystrokeAttempt } from './entities/keystrokeAttempt.entity'; // popraw ścieżkę

@Module({
  imports: [
    TypeOrmModule.forFeature([KeystrokeAttempt]), // <-- to jest kluczowe!
  ],
  providers: [KeystrokeService, KeystrokeAttemptService],
  exports: [KeystrokeService, KeystrokeAttemptService],
})
export class KeystrokeModule {}
