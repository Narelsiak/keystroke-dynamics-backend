import { User } from '../entities/user.entity';

// src/user/dto/user-response.dto.ts
export class UserResponseDto {
  id: number;
  email: string;
  secretWord: string | null;
  hasModel: boolean;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  updatedAt: Date;
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
      }
    } else {
      this.secretWord = null;
      this.hasModel = false;
    }
  }
}
