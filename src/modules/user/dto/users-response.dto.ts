import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { SecretWordSummary } from './user-response.dto';

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

  @ApiProperty({ type: SecretWordSummary, nullable: true })
  activeSecretWord: SecretWordSummary | null;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.isActive = user.isActive;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;

    const active = user.secretWords?.find((w) => w.isActive);

    if (active) {
      this.activeSecretWord = {
        id: active.id,
        word: active.word,
        modelCount: active.models?.length ?? 0,
        attemptCount: active.attempts?.length ?? 0,
        hasActiveModel: !!active.models?.find((model) => model.isActive),
      };
    } else {
      this.activeSecretWord = null;
    }
  }
}
