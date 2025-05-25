import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KeystrokeAttempt } from '../entities/keystrokeAttempt.entity';
import { KeyPressDto } from '../dto/key-press.dto';

@Injectable()
export class KeystrokeAttemptService {
  constructor(
    @InjectRepository(KeystrokeAttempt)
    private readonly attemptRepo: Repository<KeystrokeAttempt>,
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

  getAttemptsByUserId(userId: number): Promise<KeystrokeAttempt[]> {
    return this.attemptRepo.find({
      where: { user: { id: userId } },
      relations: ['user', 'keystrokes'],
      order: { createdAt: 'DESC' },
    });
  }
}
