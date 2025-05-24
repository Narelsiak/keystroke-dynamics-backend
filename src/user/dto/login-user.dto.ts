import { IsEmail, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { KeyPressDto } from 'src/keystroke/dto/key-press.dto';

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KeyPressDto)
  keyPresses: KeyPressDto[];
}
