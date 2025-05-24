import { Module } from '@nestjs/common';
import { KeystrokeService } from './services/keystroke.service';

@Module({
  providers: [KeystrokeService],
  exports: [KeystrokeService],
})
export class KeystrokeModule {}
