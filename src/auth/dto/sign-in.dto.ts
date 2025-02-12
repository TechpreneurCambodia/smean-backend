import { IsString, MinLength } from 'class-validator';

export class SignInDto {
  @IsString()
  @MinLength(4)
  usernameOrEmail: string;

  @IsString()
  @MinLength(8)
  password: string;
}
