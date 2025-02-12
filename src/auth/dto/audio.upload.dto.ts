import { IsString, IsOptional } from 'class-validator';

export class UploadAudioDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  tags?: string; // Add tags or any other fields you may need
}
