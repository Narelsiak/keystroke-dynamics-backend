// src/user/user.controller.ts
import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Req,
  Get,
  UnauthorizedException,
  Patch,
  NotFoundException,
  Delete,
  Param,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';

import { UserService } from '../services/user.service';
import { Request } from 'express';
import { KeystrokeService } from 'src/modules/keystroke/services/keystroke.service';
import { KeystrokeAttemptService } from 'src/modules/keystroke/services/keystroke-attempt.service';
import { KeyPressDto } from 'src/modules/keystroke/dto/key-press.dto';
import { SetSecretWordDto } from 'src/modules/keystroke/dto/set-secret-word.dto';
import { KeystrokeAttemptDto } from 'src/modules/keystroke/dto/keystroke-attempt.dto';
import { KeystrokeAttempt } from 'src/modules/keystroke/entities/keystrokeAttempt.entity';
import { SecretWord } from '../entities/secret-word.entity';

@Controller('secret-word')
export class SecretWordController {
  constructor(
    private readonly userService: UserService,
    private readonly keystrokeService: KeystrokeService,
    private readonly keystrokeAttemptService: KeystrokeAttemptService,
  ) {}

  @Patch('')
  async setSecretWord(
    @Body() body: SetSecretWordDto,
    @Req() req: Request,
  ): Promise<{ message: string; secretWord: string }> {
    const userId = req.session.userId;
    if (!userId) {
      throw new BadRequestException('User not logged in');
    }

    await this.userService.deactivateAllSecretWords(userId);

    const existing = await this.userService.findSecretWord(
      userId,
      body.secretWord,
    );

    let activated: SecretWord | null;
    if (existing) {
      activated = await this.userService.activateSecretWord(existing.id);
    } else {
      activated = await this.userService.addSecretWord(userId, body.secretWord);
    }

    return {
      message: existing
        ? 'Existing secret word reactivated successfully'
        : 'Secret word added successfully',
      secretWord: activated?.word ?? 'none',
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
}
