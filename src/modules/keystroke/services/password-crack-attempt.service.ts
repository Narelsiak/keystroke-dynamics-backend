// src/modules/password-crack-attempt/password-crack-attempt.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordCrackAttempt } from '../entities/passwordCrackAttempt.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PasswordCrackAttemptService {
  constructor(
    @InjectRepository(PasswordCrackAttempt)
    private readonly passwordCrackAttemptRepository: Repository<PasswordCrackAttempt>,
  ) {}
  async create(data: {
    userId: number;
    targetUserId: number;
    secretWordId: number;
    success: boolean;
    similarity: number;
    error: number;
  }) {
    return await this.passwordCrackAttemptRepository.save(data);
  }
}
