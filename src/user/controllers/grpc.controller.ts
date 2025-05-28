import {
  Controller,
  Get,
  Inject,
  Req,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { Request } from 'express';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable, of } from 'rxjs';
import { UserService } from '../services/user.service';
import { KeystrokeAttemptService } from 'src/keystroke/services/keystroke-attempt.service';

// Interface gRPC
interface KeystrokeServiceGrpc {
  Train(data: { attempts: any[] }): Observable<any>;
}

@Controller('keystrokes')
export class grpCController implements OnModuleInit {
  private keystrokeService: KeystrokeServiceGrpc;

  constructor(
    @Inject('KEYSTROKE_PACKAGE') private client: ClientGrpc,
    private readonly userService: UserService,
    private readonly keystrokeAttemptService: KeystrokeAttemptService,
  ) {}

  onModuleInit() {
    this.keystrokeService =
      this.client.getService<KeystrokeServiceGrpc>('KeystrokeService');
  }

  @Get('makemodel')
  async makeModel(@Req() req: Request): Promise<any[]> {
    const userId = req.session.userId;
    if (!userId) {
      throw new BadRequestException('User not logged in');
    }

    const user = await this.userService.findById(userId);

    if (!user?.secretWords?.length) {
      return [];
    }

    const latestSecretWord = user.secretWords[user.secretWords.length - 1];

    const attempts =
      await this.keystrokeAttemptService.getAttemptsByUserIdAndSecretWordId(
        userId,
        latestSecretWord.id,
      );

    const mapped = attempts.map((attempt) => ({
      keyPresses: attempt.keystrokes.map((event) => ({
        value: event.character,
        pressDuration: event.pressDuration,
        waitDuration: event.waitDuration,
        modifiers: event.modifiers,
      })),
    }));

    // Wysyłka całej tablicy prób naraz do gRPC (lub mocka)
    await firstValueFrom(this.keystrokeService.Train({ attempts: mapped }));

    return mapped;
  }
}
