import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, IsUrl, ValidateNested } from 'class-validator';
import { CreateNoteDto } from 'src/note/dto/create-note.dto';

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

    // @ValidateNested()
    // @Type(() => CreateNoteDto)
    // note: CreateNoteDto;

    @IsString()
    summary: string;

}
