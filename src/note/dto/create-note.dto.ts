import { IsNotEmpty, IsString } from 'class-validator';
import { User } from 'src/user/entities/user.entity';

export class CreateNoteDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsString()
    summary: string;
}
