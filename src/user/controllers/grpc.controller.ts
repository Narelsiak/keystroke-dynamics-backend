// ... inne importy
import {
  Controller,
  Get,
  Inject,
  Req,
  BadRequestException,
  OnModuleInit,
  Logger, // Dodaj Logger dla lepszego debugowania
} from '@nestjs/common';
import { Request } from 'express';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable, of } from 'rxjs';
import { UserService } from '../services/user.service';
import { KeystrokeAttemptService } from 'src/keystroke/services/keystroke-attempt.service';

// Idealnie, te typy powinny pochodzić z wygenerowanych plików .d.ts z Twojego .proto
// Na razie uproszczone interfejsy dla czytelności:
interface GrpcKeyPress {
  value: string;
  pressDuration: number;
  waitDuration: number;
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  meta: boolean;
}

interface GrpcAttempt {
  keyPresses: GrpcKeyPress[];
}

interface GrpcTrainRequest {
  attempts: GrpcAttempt[];
}

interface GrpcTrainResponse {
  message: string;
}

// Interface gRPC
interface KeystrokeServiceGrpc {
  Train(data: GrpcTrainRequest): Observable<GrpcTrainResponse>; // Użyj typów
}

@Controller('keystrokes')
export class grpCController implements OnModuleInit {
  private readonly logger = new Logger(grpCController.name); // Logger
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
    // Zmień `any[]` na coś bardziej konkretnego, np. GrpcAttempt[]
    const userId = req.session.userId;
    if (!userId) {
      throw new BadRequestException('User not logged in');
    }

    const user = await this.userService.findById(userId);

    if (!user?.secretWords?.length) {
      this.logger.warn(`User ${userId} has no secret words.`);
      return [];
    }

    const latestSecretWord = user.secretWords[user.secretWords.length - 1];

    const attempts =
      await this.keystrokeAttemptService.getAttemptsByUserIdAndSecretWordId(
        userId,
        latestSecretWord.id,
      );

    if (!attempts || attempts.length === 0) {
      this.logger.warn(
        `No attempts found for user ${userId} and secret word ${latestSecretWord.id}.`,
      );
      return [];
    }

    // Poprawione mapowanie
    const mappedAttempts: GrpcAttempt[] = attempts.map((attempt) => ({
      keyPresses: attempt.keystrokes.map((event) => ({
        value: event.character,
        pressDuration: event.pressDuration,
        waitDuration: event.waitDuration,
        // Rozpakuj obiekt modifiers
        shift: event.modifiers.shift,
        ctrl: event.modifiers.ctrl,
        alt: event.modifiers.alt,
        meta: event.modifiers.meta,
      })),
    }));

    this.logger.log(
      'Mapped attempts being sent to gRPC:',
      JSON.stringify(mappedAttempts, null, 2),
    );

    try {
      const response = await firstValueFrom(
        this.keystrokeService.Train({ attempts: mappedAttempts }),
      );
      this.logger.log('gRPC Train response:', response);
      return mappedAttempts; // Lub response, w zależności co chcesz zwrócić
    } catch (error) {
      this.logger.error('Error calling gRPC Train service:', error);
      // Możesz rzucić bardziej szczegółowy błąd, jeśli chcesz
      throw new BadRequestException('Failed to train model via gRPC');
    }
  }
}
