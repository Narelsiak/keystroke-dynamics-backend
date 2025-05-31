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
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { UserService } from '../services/user.service';
import { KeystrokeAttemptService } from 'src/modules/keystroke/services/keystroke-attempt.service';
import { keystroke as ks } from 'src/proto/keystroke';
import { SecretWord } from '../entities/secret-word.entity';
import { KeystrokeModelService } from 'src/modules/keystroke/services/keystroke-model.service';
import { KeyPressDto } from 'src/modules/keystroke/dto/key-press.dto';
import { KeystrokeService } from 'src/modules/keystroke/services/keystroke.service';

interface KeystrokeServiceGrpc {
  Train(data: ks.TrainRequest): Observable<ks.TrainResponse>;
  GetModelCount(data: ks.ModelCountRequest): Observable<ks.ModelCountResponse>;
  DeleteModel(data: ks.DeleteModelRequest): Observable<ks.DeleteModelResponse>;
  Evaluate(data: ks.EvaluateRequest): Observable<ks.EvaluateResponse>;
  Predict(data: ks.PredictRequest): Observable<ks.PredictResponse>;
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
    private readonly keyStrokeServiceKey: KeystrokeService,
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

    const modelCount =
      await this.keyStrokeModelService.countModelsByUserId(userId);
    if (modelCount >= 5) {
      throw new BadRequestException('You can have a maximum of 5 models.');
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
      selectedSecretWord = user.secretWords.find((sw) => sw.isActive) ?? null;
    }

    if (!selectedSecretWord) {
      throw new BadRequestException('No active secret word found.');
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

      await this.keyStrokeModelService.deactivateOtherModelsForSecretWord(
        selectedSecretWord.id,
      );

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

    const model = await this.keyStrokeModelService.findByName(body.modelName);

    if (!model || model.secretWord.user.id !== user.id) {
      throw new ForbiddenException('You do not own this model');
    }

    try {
      const response = await firstValueFrom(
        this.keystrokeService.DeleteModel({
          email: user.email,
          modelName: body.modelName,
        }),
      );
      await this.keyStrokeModelService.deleteByName(body.modelName);
      this.logger.log('gRPC DeleteModel response:', response);
      return response;
    } catch (error) {
      this.logger.error('Error calling gRPC DeleteModel:', error);
      throw new BadRequestException('Failed to delete model via gRPC');
    }
  }

  @Post('evaluate')
  async evaluateKeystrokes(
    @Req() req: Request,
    @Body() body: { secretWord?: string | null },
  ): Promise<ks.EvaluateResponse> {
    const userId = req.session.userId;
    if (!userId) {
      throw new BadRequestException('User not logged in');
    }

    const user = await this.userService.findById(userId);

    if (!user?.email || !user.secretWords?.length) {
      throw new BadRequestException('Invalid user or no secret words.');
    }

    const { secretWord = null } = body;

    let selectedSecretWord: SecretWord | null = null;
    if (secretWord) {
      const found = user.secretWords.find((word) => word.word === secretWord);
      if (!found) {
        throw new BadRequestException('Given secret word not found.');
      }
      selectedSecretWord = found;
    } else {
      selectedSecretWord = user.secretWords.find((sw) => sw.isActive) ?? null;
      if (!selectedSecretWord) {
        throw new BadRequestException('No active secret word found.');
      }
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
        this.keystrokeService.Evaluate({
          attempts: mappedAttempts,
        }),
      );
      this.logger.log('gRPC Evaluate response:', response);
      return response;
    } catch (error) {
      this.logger.error('Error calling gRPC Evaluate service:', error);
      throw new BadRequestException('Failed to evaluate data via gRPC');
    }
  }

  @Post('predict')
  async predictAttempt(
    @Body()
    body: {
      keyPresses: KeyPressDto[];
      secretWord: string;
      targetUserId: number;
    },
    @Req() req: Request,
  ): Promise<ks.PredictResponse> {
    const userId = req.session.userId;
    if (!userId) {
      throw new BadRequestException('User not logged in');
    }

    const user = await this.userService.findById(userId);
    const targetUser = await this.userService.findById(body.targetUserId);

    if (!targetUser?.secretWords) {
      throw new BadRequestException('Target user not found');
    }

    const targetSecretWord = targetUser.secretWords.find(
      (sw) => sw.word === body.secretWord,
    );

    if (!targetSecretWord?.isActive) {
      throw new BadRequestException('Secret word not found for target user');
    }

    const model = targetSecretWord.models.find((model) => model.isActive);

    if (!model) {
      throw new BadRequestException(
        'No trained model found for that secret word',
      );
    }

    // opcjonalna lokalna walidacja keyPresses
    const { success } = this.keyStrokeServiceKey.validateUserStyle(
      body.keyPresses,
      body.secretWord,
    );

    if (!success) {
      throw new BadRequestException('Keystroke validation failed');
    }

    // GRPC prediction
    const prediction = await firstValueFrom(
      this.keystrokeService.Predict({
        email: user?.email,
        modelName: model.modelName,
        attempt: {
          keyPresses: body.keyPresses.map((kp) => ({
            value: kp.value,
            pressDuration: kp.pressDuration,
            waitDuration: kp.waitDuration,
            shift: kp.modifiers.shift,
            ctrl: kp.modifiers.ctrl,
            alt: kp.modifiers.alt,
            meta: kp.modifiers.meta,
          })),
        },
      }),
    );

    this.logger.log('gRPC Evaluate response:', prediction);

    // const { status, similarity, error } = prediction;

    // // Zapisujemy do bazy
    // await this.passwordCrackAttemptService.create({
    //   userId,
    //   targetUserId: targetUser.id,
    //   secretWordId: targetSecretWord.id,
    //   success,
    //   similarity,
    //   error,
    // });
    return prediction;
    // return { success, similarity, error };
  }
}
