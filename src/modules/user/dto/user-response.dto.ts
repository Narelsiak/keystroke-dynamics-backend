import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserResponseDto {
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

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.isActive = user.isActive;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;

    if (user.secretWords && user.secretWords.length > 0) {
      const secretWord = user.secretWords.find((word) => word.isActive);
      if (secretWord) {
        this.secretWord = secretWord.word;
        this.hasModel = !!secretWord.models.find((model) => model.isActive);
        return;
      }
    }

    this.secretWord = null;
    this.hasModel = false;
  }
}
