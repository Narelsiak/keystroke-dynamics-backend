import {
  IsString,
  IsNumber,
  IsDefined,
  IsBoolean,
  ValidateNested,
  IsDate,
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

  @Type(() => Date)
  @IsDate()
  pressedAt: Date;

  @Type(() => Date)
  @IsDate()
  releasedAt: Date;

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
