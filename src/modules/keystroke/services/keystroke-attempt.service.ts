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

  async saveAttempt(
    userId: number,
    keyPresses: KeyPressDto[],
    wordId: number,
  ): Promise<KeystrokeAttempt> {
    const attempt = this.attemptRepo.create({
      user: { id: userId },
      secretWord: { id: wordId },
      keystrokes: keyPresses.map((kp, index) => ({
        character: kp.value,
        pressedAt: kp.pressedAt,
        releasedAt: kp.releasedAt,
        pressDuration: kp.pressDuration,
        waitDuration: kp.waitDuration,
        modifiers: kp.modifiers,
        position: index,
      })),
    });

    return await this.attemptRepo.save(attempt);
  }

  async getAttemptsByUserIdAndSecretWordId(
    userId: number,
    secretWordId: number,
  ): Promise<KeystrokeAttempt[]> {
    return this.attemptRepo.find({
      where: {
        user: { id: userId },
        secretWord: { id: secretWordId },
      },
      relations: ['keystrokes'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<KeystrokeAttempt | null> {
    return this.attemptRepo.findOne({
      where: { id },
      relations: ['user', 'secretWord', 'keystrokes'],
    });
  }

  async delete(id: number): Promise<void> {
    await this.attemptRepo.delete(id);
  }

  async getAttemptsByUserIdAndWordId(
    userId: number,
    secretWordId: number,
  ): Promise<KeystrokeAttempt[]> {
    return this.attemptRepo.find({
      where: {
        user: { id: userId },
        secretWord: { id: secretWordId },
      },
      relations: ['keystrokes'],
      order: { createdAt: 'DESC' },
    });
  }
}
