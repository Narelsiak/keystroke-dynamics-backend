// src/user/user.controller.ts
import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Req,
  Get,
  UnauthorizedException,
  Res,
  Patch,
  NotFoundException,
  Delete,
  Param,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';

import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { Request, Response } from 'express';
import { LoginUserDto } from '../dto/login-user.dto';
import { KeystrokeService } from 'src/modules/keystroke/services/keystroke.service';
import { KeystrokeAttemptService } from 'src/modules/keystroke/services/keystroke-attempt.service';
import { KeyPressDto } from 'src/modules/keystroke/dto/key-press.dto';
import { SetSecretWordDto } from 'src/modules/keystroke/dto/set-secret-word.dto';
import { UpdateUserNameDto } from '../dto/update-user-data.dto';
import { KeystrokeAttemptDto } from 'src/modules/keystroke/dto/keystroke-attempt.dto';
import { KeystrokeAttempt } from 'src/modules/keystroke/entities/keystrokeAttempt.entity';
import { KeystrokeModelService } from 'src/modules/keystroke/services/keystroke-model.service';
import { KeystrokeModelDto } from 'src/modules/keystroke/dto/list-keystroke-models-response.dto';

@Controller('users')
export class UserController {
  // wstrzykniecie serwisu do kontrolera
  constructor(
    private readonly userService: UserService,
    private readonly keystrokeService: KeystrokeService,
    private readonly keystrokeAttemptService: KeystrokeAttemptService,
    private readonly keyStrokeModelService: KeystrokeModelService,
  ) {}

  // users/register
  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request,
  ): Promise<UserResponseDto> {
    try {
      const user = await this.userService.register(createUserDto);

      req.session.userId = user.id;
      return new UserResponseDto(user);
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e.message);
    }
  }

  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Req() req: Request,
  ): Promise<UserResponseDto> {
    try {
      const user = await this.userService.login(loginUserDto);
      req.session.userId = user.id;

      return new UserResponseDto(user);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy((err) => {
      if (err) {
        throw new BadRequestException('Logout failed');
      }
      res.clearCookie('connect.sid');
      return res.send({ success: true });
    });
  }

  @Get('profile')
  async getProfile(@Req() req: Request): Promise<UserResponseDto> {
    if (!req.session.userId) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findById(req.session.userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    return new UserResponseDto(user);
  }

  @Get('')
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userService.findAll();
    return users.map((user) => new UserResponseDto(user));
  }

  @Patch('secret-word')
  async setSecretWord(
    @Body() body: SetSecretWordDto,
    @Req() req: Request,
  ): Promise<{ message: string; secretWord: string }> {
    const userId = req.session.userId;
    if (!userId) {
      throw new BadRequestException('User not logged in');
    }

    const alreadyUsed = await this.userService.hasUserUsedSecretWord(
      userId,
      body.secretWord,
    );
    if (alreadyUsed) {
      throw new BadRequestException('You have already used this secret word');
    }

    await this.userService.deactivateAllSecretWords(userId);

    const newSecretWord = await this.userService.addSecretWord(
      userId,
      body.secretWord,
    );

    return {
      message: 'Secret word added successfully',
      secretWord: newSecretWord.word,
    };
  }

  @Post('add-data')
  async addData(
    @Body()
    body: {
      keyPresses: KeyPressDto[];
      secretWord: string;
    },
    @Req() req: Request,
  ): Promise<{ attempt: KeystrokeAttempt }> {
    const userId = req.session.userId;
    if (!userId) {
      throw new BadRequestException('User not logged in');
    }

    const user = await this.userService.findById(userId);

    const activeSecretWord =
      user?.secretWords?.find((sw) => sw.isActive) ?? null;

    console.log(activeSecretWord);
    if (activeSecretWord?.word !== body.secretWord) {
      throw new UnauthorizedException('Invalid secret word');
    }

    const { success, keyPresses } = this.keystrokeService.validateUserStyle(
      body.keyPresses,
      body.secretWord,
    );

    if (success) {
      return {
        attempt: await this.keystrokeAttemptService.saveAttempt(
          userId,
          keyPresses,
          activeSecretWord.id,
        ),
      };
    } else {
      throw new BadRequestException('Keystroke validation failed');
    }
  }
  @Patch('name')
  async updateUserName(
    @Body() body: UpdateUserNameDto,
    @Req() req: Request,
  ): Promise<UserResponseDto> {
    const userId = req.session.userId;
    if (!userId) {
      throw new BadRequestException('User not logged in');
    }

    await this.userService.updateUserName(
      userId,
      body.firstName,
      body.lastName,
    );

    const updatedUser = await this.userService.findById(userId);
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return new UserResponseDto(updatedUser);
  }

  @Get('attempts')
  async getUserAttempts(@Req() req: Request): Promise<KeystrokeAttemptDto[]> {
    const userId = req.session.userId;
    if (!userId) {
      throw new BadRequestException('User not logged in');
    }

    const user = await this.userService.findById(userId);

    if (!user?.secretWords?.length) {
      return [];
    }

    const activeSecretWord = user.secretWords.find((sw) => sw.isActive) ?? null;
    if (!activeSecretWord) {
      throw new NotFoundException('No active secret word found for user');
    }

    const attempts =
      await this.keystrokeAttemptService.getAttemptsByUserIdAndSecretWordId(
        userId,
        activeSecretWord.id,
      );

    // odchylenia
    // zmienna isCorrect będzie informować o tym, czy próbka jest dobra uwzględniając próg akceptowalny (ty miales 0.25, 0.75 na sztywno).
    // czyli jesli sie miesci to true a jak nie to false i ja moze uzytkownik wywalic
    // oprocz tego fajnie by bylo dodac info o w jakim stopniu jest ona zbiezna do ideału (0.5) czyli np majac 0.88 bedzie uzasadnione czemu jest ona do wywalenia
    return attempts.map((attempt) => ({
      id: attempt.id,
      createdAt: attempt.createdAt,
      isCorrect: true,
      keyPresses: attempt.keystrokes.map((event) => ({
        value: event.character,
        pressedAt: event.pressedAt.toString(),
        releasedAt: event.releasedAt.toString(),
        pressDuration: event.pressDuration,
        waitDuration: event.waitDuration,
        modifiers: event.modifiers,
      })),
    }));
  }

  @Delete('attempts/:id')
  async deleteAttempt(
    @Param('id') attemptId: number,
    @Req() req: Request,
  ): Promise<{ message: string; remainingAttempts: KeystrokeAttemptDto[] }> {
    const userId = req.session.userId;
    if (!userId) {
      throw new BadRequestException('User not logged in');
    }

    const attempt = await this.keystrokeAttemptService.findById(attemptId);

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this attempt',
      );
    }

    const secretWordId = attempt.secretWord.id;
    if (!secretWordId) {
      throw new InternalServerErrorException(
        'Attempt has no associated secret word',
      );
    }
    await this.keystrokeAttemptService.delete(attemptId);

    const remaining =
      await this.keystrokeAttemptService.getAttemptsByUserIdAndWordId(
        userId,
        secretWordId,
      );

    // TODO isCorrect
    const remainingAttempts: KeystrokeAttemptDto[] = remaining.map(
      (attempt) => ({
        id: attempt.id,
        isCorrect: false,
        createdAt: attempt.createdAt,
        keyPresses: attempt.keystrokes.map((event) => ({
          value: event.character,
          pressedAt: event.pressedAt.toString(),
          releasedAt: event.releasedAt.toString(),
          pressDuration: event.pressDuration,
          waitDuration: event.waitDuration,
          modifiers: event.modifiers,
        })),
      }),
    );

    return {
      message: 'Attempt deleted successfully',
      remainingAttempts,
    };
  }
  @Get('models')
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

  @Patch('models/activate')
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
