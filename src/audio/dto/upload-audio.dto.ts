import { IsOptional, IsString } from 'class-validator';

export class UploadAudioDto {
@IsOptional()
@IsString()
  description?: string;
}
