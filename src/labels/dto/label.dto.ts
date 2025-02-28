import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateLabelDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
