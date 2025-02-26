import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateLabelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @MaxLength(255)
  description?: string;
}
