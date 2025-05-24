import {
  IsString,
  IsNumber,
  IsDefined,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ModifiersDto {
  @IsBoolean()
  @IsDefined()
  shift: boolean;

  @IsBoolean()
  @IsDefined()
  ctrl: boolean;

  @IsBoolean()
  @IsDefined()
  alt: boolean;

  @IsBoolean()
  @IsDefined()
  meta: boolean;
}

export class KeyPressDto {
  @IsString()
  @IsDefined()
  value: string;

  @IsString()
  @IsDefined()
  pressedAt: string;

  @IsString()
  @IsDefined()
  releasedAt: string;

  @IsNumber()
  @IsDefined()
  pressDuration: number;

  @IsNumber()
  @IsDefined()
  waitDuration: number;

  @ValidateNested()
  @Type(() => ModifiersDto)
  @IsDefined()
  modifiers: ModifiersDto;
}
