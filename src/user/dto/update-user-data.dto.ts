import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateUserNameDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;
}
