import { IsNotEmpty } from 'class-validator';

export class UploadAudioDto {
  @IsNotEmpty()
  file: string;
}
