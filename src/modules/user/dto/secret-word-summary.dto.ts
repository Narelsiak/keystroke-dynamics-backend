import { ApiProperty } from '@nestjs/swagger';

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
