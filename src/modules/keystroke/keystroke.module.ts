import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeystrokeService } from './services/keystroke.service';
import { KeystrokeAttemptService } from './services/keystroke-attempt.service';
import { KeystrokeAttempt } from './entities/keystrokeAttempt.entity'; // popraw ścieżkę
import { KeystrokeModelEntity } from './entities/keystrokeModel.entity';
import { KeystrokeModelService } from './services/keystroke-model.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([KeystrokeAttempt]),
    TypeOrmModule.forFeature([KeystrokeModelEntity]), // <-- to jest kluczowe!
  ],
  providers: [KeystrokeService, KeystrokeAttemptService, KeystrokeModelService],
  exports: [KeystrokeService, KeystrokeAttemptService, KeystrokeModelService],
})
export class KeystrokeModule {}
