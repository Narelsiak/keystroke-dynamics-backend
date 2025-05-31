// keystroke-model.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KeystrokeModelEntity } from '../entities/keystrokeModel.entity';
import { SecretWord } from 'src/modules/user/entities/secret-word.entity';

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
  async deactivateOtherModelsForSecretWord(
    secretWordId: number,
  ): Promise<void> {
    await this.modelRepo.update(
      { secretWord: { id: secretWordId } },
      { isActive: false },
    );
  }

  async activateModelForUser(modelName: string, userId: number): Promise<void> {
    const model = await this.modelRepo.findOne({
      where: {
        modelName,
        secretWord: {
          user: { id: userId },
        },
      },
      relations: ['secretWord', 'secretWord.user'],
    });

    if (!model) {
      throw new Error('Model not found or not authorized.');
    }

    // Deaktywuj inne modele dla tego secretWorda
    await this.deactivateOtherModelsForSecretWord(model.secretWord.id);

    // Aktywuj wskazany model
    await this.modelRepo.update({ id: model.id }, { isActive: true });
  }

  async deleteByName(modelName: string): Promise<void> {
    await this.modelRepo.delete({
      modelName: modelName,
    });
  }
  async findByName(modelName: string): Promise<KeystrokeModelEntity | null> {
    return await this.modelRepo.findOne({
      where: { modelName },
      relations: ['secretWord', 'secretWord.user'],
    });
  }

  async countModelsByUserId(userId: number): Promise<number> {
    return this.modelRepo.count({
      where: {
        secretWord: {
          user: {
            id: userId,
          },
        },
      },
      relations: ['secretWord', 'secretWord.user'],
    });
  }
}
