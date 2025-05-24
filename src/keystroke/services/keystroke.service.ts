import { Injectable } from '@nestjs/common';
import { KeyPressDto } from '../dto/key-press.dto';

@Injectable()
export class KeystrokeService {
  // Inject repos, if needed, e.g. constructor(...)

  async validateUserStyle(
    userId: number,
    keyPresses: KeyPressDto[],
  ): Promise<boolean> {
    console.log(`Validating keystroke dynamics for user ID: ${userId}`);
    console.log(`Total key presses received: ${keyPresses.length}`);

    for (const press of keyPresses) {
      console.log(`Key value: ${press.value}`);
    }

    // Tymczasowy return do testów
    return true;
  }
}
