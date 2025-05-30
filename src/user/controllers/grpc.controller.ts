import {
  Controller,
  Get,
  Inject,
  Req,
  BadRequestException,
  OnModuleInit,
  Logger,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { UserService } from '../services/user.service';
import { KeystrokeAttemptService } from 'src/keystroke/services/keystroke-attempt.service';
import { keystroke as ks } from 'src/proto/keystroke';
import { SecretWord } from '../entities/secret-word.entity';
import { KeystrokeModelService } from 'src/keystroke/services/keystroke-model.service';

interface KeystrokeServiceGrpc {
  Train(data: ks.TrainRequest): Observable<ks.TrainResponse>;
  GetModelCount(data: ks.ModelCountRequest): Observable<ks.ModelCountResponse>;
  DeleteModel(data: ks.DeleteModelRequest): Observable<ks.DeleteModelResponse>;
}

@Controller('keystrokes')
export class grpcController implements OnModuleInit {
  private readonly logger = new Logger(grpcController.name);
  private keystrokeService: KeystrokeServiceGrpc;

  constructor(
    @Inject('KEYSTROKE_PACKAGE') private client: ClientGrpc,
    private readonly userService: UserService,
    private readonly keystrokeAttemptService: KeystrokeAttemptService,
    private readonly keyStrokeModelService: KeystrokeModelService,
  ) {}

  onModuleInit() {
    this.keystrokeService =
      this.client.getService<KeystrokeServiceGrpc>('KeystrokeService');
  }

  @Get('make-model')
  async makeModel(
    @Req() req: Request,
    @Query() body: { secretWord: string | null },
  ): Promise<ks.TrainResponse> {
    const userId = req.session.userId;
    if (!userId) {
      throw new BadRequestException('User not logged in');
    }

    const user = await this.userService.findById(userId);

    if (!user?.secretWords?.length) {
      throw new BadRequestException('No secret words found for user.');
    }

    // Pobieramy treść secretWord z body
    const { secretWord = null } = body;

    let selectedSecretWord: SecretWord | null = null;
    if (secretWord) {
      const found = user.secretWords.find((word) => word.word === secretWord);
      if (!found) {
        throw new BadRequestException('Given secret word not found.');
      }
      selectedSecretWord = found;
    } else {
      selectedSecretWord = user.secretWords[user.secretWords.length - 1];
    }

    const attempts =
      await this.keystrokeAttemptService.getAttemptsByUserIdAndSecretWordId(
        userId,
        selectedSecretWord.id,
      );

    if (attempts.length === 0) {
      throw new BadRequestException('No attempts found.');
    }

    const mappedAttempts: ks.Attempt[] = attempts.map((attempt) => ({
      keyPresses: attempt.keystrokes.map((event) => ({
        value: event.character,
        pressDuration: event.pressDuration,
        waitDuration: event.waitDuration,
        shift: event.modifiers.shift,
        ctrl: event.modifiers.ctrl,
        alt: event.modifiers.alt,
        meta: event.modifiers.meta,
      })),
    }));

    try {
      const response = await firstValueFrom(
        this.keystrokeService.Train({
          attempts: mappedAttempts,
          email: user.email,
        }),
      );
      this.logger.log('gRPC Train response:', response);
      console.log(response.stats?.finalLoss ?? 0);
      await this.keyStrokeModelService.createModel({
        modelName: response.id ?? '',
        isActive: true,
        trainedAt: new Date(),
        samplesUsed: response.stats?.samples ?? 0,
        secretWord: selectedSecretWord,
        loss: response.stats?.finalLoss ?? 0,
      });
      return response;
    } catch (error) {
      this.logger.error('Error calling gRPC Train service:', error);
      throw new BadRequestException('Failed to train model via gRPC');
    }
  }

  @Get('model-count')
  async getModelCount(@Req() req: Request): Promise<ks.ModelCountResponse> {
    const userId = req.session.userId;
    if (!userId) {
      throw new BadRequestException('User not logged in');
    }

    const user = await this.userService.findById(userId);

    if (!user?.email) {
      throw new BadRequestException('User email not found');
    }

    try {
      const response = await firstValueFrom(
        this.keystrokeService.GetModelCount({
          email: user.email,
        }),
      );
      return response;
    } catch (error) {
      this.logger.error('Error calling gRPC GetModelCount:', error);
      throw new BadRequestException('Failed to get model count via gRPC');
    }
  }

  @Post('delete-model')
  async deleteModel(
    @Req() req: Request,
    @Body() body: { modelName: string },
  ): Promise<ks.DeleteModelResponse> {
    const userId = req.session.userId;
    if (!userId) {
      throw new BadRequestException('User not logged in');
    }

    const user = await this.userService.findById(userId);

    if (!user?.email) {
      throw new BadRequestException('User email not found');
    }

    if (!body.modelName) {
      throw new BadRequestException('Model name is required');
    }

    try {
      const response = await firstValueFrom(
        this.keystrokeService.DeleteModel({
          email: user.email,
          modelName: body.modelName,
        }),
      );
      this.logger.log('gRPC DeleteModel response:', response);
      return response;
    } catch (error) {
      this.logger.error('Error calling gRPC DeleteModel:', error);
      throw new BadRequestException('Failed to delete model via gRPC');
    }
  }
}
