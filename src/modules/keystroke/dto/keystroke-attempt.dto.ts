import { KeyPressDto } from './key-press.dto';

export class KeystrokeAttemptDto {
  id: number;
  createdAt: Date;
  isCorrect: boolean | null;
  keyPresses: KeyPressDto[];
}
