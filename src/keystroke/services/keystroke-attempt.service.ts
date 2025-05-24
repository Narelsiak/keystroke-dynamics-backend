import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordAttempt } from '../entities/passwordAttempt.entity';
import { KeyPressDto } from '../dto/key-press.dto';
import { KeystrokeEvent } from '../entities/keystrokeEvent.entity'; // popraw ścieżkę

@Injectable()
export class KeystrokeAttemptService {
  constructor(
    @InjectRepository(PasswordAttempt)
    private readonly attemptRepo: Repository<PasswordAttempt>,
  ) {}

  async saveAttempt(userId: number, keyPresses: KeyPressDto[]): Promise<void> {
    // Tworzymy nową próbę z userId (user powiązany przez userId)
    const attempt = this.attemptRepo.create({
      userId,
      keystrokes: keyPresses.map((kp, index) => ({
        character: kp.value,
        pressedAt: new Date(kp.pressedAt).getTime(),
        releasedAt: new Date(kp.releasedAt).getTime(),
        pressDuration: kp.pressDuration,
        waitDuration: kp.waitDuration,
        modifiers: kp.modifiers,
        position: index,
      })),
    });

    await this.attemptRepo.save(attempt);
  }
}
