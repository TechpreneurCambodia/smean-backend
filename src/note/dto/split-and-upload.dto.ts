import { IsString, IsNumber } from 'class-validator';

export class SplitAndUpload {
  @IsString()
  title?: string;

  chunkDuration?: number | null;
}
