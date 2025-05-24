import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class SetSecretWordDto {
  @IsString()
  @MinLength(8, { message: 'Sekretne słowo musi mieć co najmniej 8 znaków' })
  @MaxLength(15, { message: 'Sekretne słowo może mieć maksymalnie 15 znaków' })
  @Matches(/\d/, {
    message: 'Sekretne słowo musi zawierać co najmniej 1 cyfrę',
  })
  @Matches(/[a-z]/, {
    message: 'Sekretne słowo musi zawierać co najmniej 1 małą literę',
  })
  @Matches(/[A-Z]/, {
    message: 'Sekretne słowo musi zawierać co najmniej 1 dużą literę',
  })
  @Matches(/[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?`~]/, {
    message: 'Sekretne słowo musi zawierać co najmniej 1 znak specjalny',
  })
  @Matches(/^[a-zA-Z0-9!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?`~]+$/, {
    message:
      'Sekretne słowo może zawierać tylko litery, cyfry i znaki specjalne',
  })
  secretWord: string;
}
