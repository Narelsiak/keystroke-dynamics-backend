import { ApiProperty } from '@nestjs/swagger';
import { KeyPressDto } from 'src/modules/keystroke/dto/key-press.dto';

export class SecretWordSummary {
  @ApiProperty()
  id: number;

  @ApiProperty()
  word: string;

  @ApiProperty()
  modelCount: number;

  @ApiProperty()
  attemptCount: number;

  @ApiProperty()
  hasActiveModel: boolean;
}

export class SecretWordActiveSummary extends SecretWordSummary {
  attempts: KeyPressDto[];
}

export class SecretWordAttemptsSummary extends SecretWordSummary {
  myAttempts: number;
  mySuccessfulAttempts: number;
}
