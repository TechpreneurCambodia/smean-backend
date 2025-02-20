import { IsEnum, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateNoteSourceDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    content: string;

    @IsNotEmpty({ message: 'noteType is required' })
    @IsEnum(['audio', 'video', 'text'])
    noteType: 'audio' | 'video' | 'text';

    @IsNotEmpty()
    sourceUrl: string;

    @IsNotEmpty()
    @IsString()
    transcription: string;

}
