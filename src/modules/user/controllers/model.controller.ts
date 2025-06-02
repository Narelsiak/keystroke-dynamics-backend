// src/user/user.controller.ts
import {
  Controller,
  Body,
  BadRequestException,
  Req,
  Get,
  Patch,
} from '@nestjs/common';

import { Request } from 'express';
import { KeystrokeModelService } from 'src/modules/keystroke/services/keystroke-model.service';
import { KeystrokeModelDto } from 'src/modules/keystroke/dto/list-keystroke-models-response.dto';
import { KeystrokeModelEntity } from 'src/modules/keystroke/entities/keystrokeModel.entity';

@Controller('model')
export class ModelController {
  constructor(private readonly keyStrokeModelService: KeystrokeModelService) {}

  @Get('list')
  async listModels(@Req() req: Request): Promise<KeystrokeModelDto[]> {
    const userId = req.session.userId;
    if (!userId) {
      throw new BadRequestException('User not logged in');
    }

    const models = await this.keyStrokeModelService.getModelsByUserId(userId);

    return models.map((model) => ({
      modelName: model.modelName,
      isActive: model.isActive,
      trainedAt: model.trainedAt.toISOString(),
      samplesUsed: model.samplesUsed,
      loss: model.loss,
      secretWord: model.secretWord.word,
    }));
  }

  @Patch('')
  async activateModel(
    @Body('modelName') modelName: string,
    @Req() req: Request,
  ): Promise<KeystrokeModelDto[]> {
    const userId = req.session.userId;
    if (!userId) {
      throw new BadRequestException('User not logged in');
    }

    try {
      await this.keyStrokeModelService.activateModelForUser(modelName, userId);

      const models = await this.keyStrokeModelService.getModelsByUserId(userId);

      return models.map((model) => ({
        modelName: model.modelName,
        isActive: model.isActive,
        trainedAt: model.trainedAt.toISOString(),
        samplesUsed: model.samplesUsed,
        loss: model.loss,
        secretWord: model.secretWord.word,
      }));
    } catch (error) {
      console.error('Error activating model:', error);
      throw new BadRequestException('Activation failed');
    }
  }
  @Patch('threshold')
  async updateModelThreshold(
    @Body('modelName') modelName: string,
    @Body('threshold') threshold: number,
    @Req() req: Request,
  ): Promise<KeystrokeModelEntity> {
    const userId = req.session.userId;
    if (!userId) {
      throw new BadRequestException('User not logged in');
    }

    if (typeof threshold !== 'number' || threshold < 0 || threshold > 100) {
      throw new BadRequestException(
        'Threshold must be a number between 0 and 100',
      );
    }

    try {
      const response = await this.keyStrokeModelService.updateThreshold(
        modelName,
        userId,
        threshold,
      );
      return response;
    } catch (error) {
      console.error('Error updating threshold:', error);
      throw new BadRequestException('Threshold update failed');
    }
  }
}
