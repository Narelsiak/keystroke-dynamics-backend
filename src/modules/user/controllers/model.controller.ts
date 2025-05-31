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

@Controller('model')
export class ModelController {
  constructor(private readonly keyStrokeModelService: KeystrokeModelService) {}

  @Get('')
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
}
