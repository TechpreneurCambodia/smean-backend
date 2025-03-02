import { IsNotEmpty, IsString } from 'class-validator';
import { User } from 'src/user/entities/user.entity';
import { PrimaryGeneratedColumn } from 'typeorm';

export class CreateNoteDto {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsString()
    summary: string;
}
