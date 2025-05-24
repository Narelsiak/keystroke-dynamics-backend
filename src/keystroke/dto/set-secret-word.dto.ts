// dto/set-secret-word.dto.ts
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class SetSecretWordDto {
  @IsString()
  @MinLength(4, { message: 'Secret word must be at least 4 characters long' })
  @MaxLength(32, { message: 'Secret word must be at most 32 characters long' })
  @Matches(/^[a-zA-Z0-9]+$/, { message: 'Secret word must be alphanumeric' })
  secretWord: string;
}
