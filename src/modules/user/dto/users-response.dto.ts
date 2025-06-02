import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { SecretWordAttemptsSummary } from './secret-word-summary.dto';

export class UsersResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  secretWord: string | null;

  @ApiProperty()
  hasModel: boolean;

  @ApiProperty({ nullable: true })
  firstName: string | null;

  @ApiProperty({ nullable: true })
  lastName: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: SecretWordAttemptsSummary, nullable: true })
  activeSecretWord: SecretWordAttemptsSummary | null;

  constructor(user: User, userId?: number) {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.isActive = user.isActive;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;

    const active = user.secretWords?.find((w) => w.isActive);

    if (active) {
      const myAttempts = active.passwordCrackAttempts.filter(
        (a) => a.userId == userId,
      );
      const successfulAttempts = myAttempts.filter((a) => a.success).length;

      this.activeSecretWord = {
        id: active.id,
        word: active.word,
        modelCount: active.models?.length ?? 0,
        attemptCount: active.attempts?.length ?? 0,
        hasActiveModel: !!active.models?.find((model) => model.isActive),
        myAttempts: myAttempts.length,
        mySuccessfulAttempts: successfulAttempts,
      };
    } else {
      this.activeSecretWord = null;
    }
  }
}
