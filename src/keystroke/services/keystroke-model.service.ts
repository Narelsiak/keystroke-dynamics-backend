// keystroke-model.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KeystrokeModelEntity } from '../entities/keystrokeModel.entity';
import { SecretWord } from 'src/user/entities/secret-word.entity';

@Injectable()
export class KeystrokeModelService {
  constructor(
    @InjectRepository(KeystrokeModelEntity)
    private modelRepo: Repository<KeystrokeModelEntity>,
  ) {}

  async createModel(data: {
    secretWord: SecretWord;
    modelName: string;
    isActive: boolean;
    trainedAt: Date;
    samplesUsed: number;
    loss: number;
  }) {
    const model = this.modelRepo.create(data);
    return this.modelRepo.save(model);
  }

  async getModelsByUserId(userId: number) {
    return this.modelRepo.find({
      where: {
        secretWord: {
          user: {
            id: userId,
          },
        },
      },
      relations: ['secretWord', 'secretWord.user'],
      order: { trainedAt: 'DESC' },
    });
  }
}
