import { Injectable } from '@nestjs/common';
import { KeyPressDto } from '../dto/key-press.dto';

@Injectable()
export class KeystrokeService {
  validateUserStyle(
    userId: number,
    keyPresses: KeyPressDto[],
    loginPassword: string,
  ): { success: boolean; keyPresses: KeyPressDto[] } {
    console.log(`Validating keystroke dynamics for user ID: ${userId}`);
    console.log(`Total key presses received: ${keyPresses.length}`);

    for (const press of keyPresses) {
      console.log(`Key value: ${press.value}`);
    }

    const reconstructKeyPresses = this.reconstructKeyPresses(keyPresses);

    if (
      loginPassword ===
      reconstructKeyPresses.map((press) => press.value).join('')
    ) {
      return { success: true, keyPresses: reconstructKeyPresses };
    }
    return { success: false, keyPresses: [] };
  }

  private reconstructKeyPresses(keyPresses: KeyPressDto[]): KeyPressDto[] {
    const buffer: KeyPressDto[] = [];

    for (const press of keyPresses) {
      const key = press.value;

      if (key === 'Backspace') {
        buffer.pop();
      } else {
        buffer.push(press);
      }
    }

    return buffer;
  }
}
