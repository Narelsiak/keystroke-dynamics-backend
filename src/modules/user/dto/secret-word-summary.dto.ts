import { ApiProperty } from '@nestjs/swagger';
import { KeyPressDto } from 'src/modules/keystroke/dto/key-press.dto';
import { KeystrokeModelEntity } from 'src/modules/keystroke/entities/keystrokeModel.entity';

export class SecretWordSummary {
  @ApiProperty()
  id: number;

  @ApiProperty()
  word: string;

  @ApiProperty()
  modelCount: number;

  @ApiProperty()
  samplesCount: number;

  @ApiProperty()
  hasActiveModel: boolean;
}

export class SecretWordActiveSummary extends SecretWordSummary {
  attempts: KeyPressDto[];
}

export class SecretWordAttemptsSummary extends SecretWordSummary {
  myAttemptsCount: number;
  mySuccessfulAttemptsCount: number;
  model: KeystrokeModelEntity | null;
}
