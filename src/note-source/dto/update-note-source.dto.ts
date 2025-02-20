import { PartialType } from '@nestjs/swagger';
import { CreateNoteSourceDto } from './create-note-source.dto';

export class UpdateNoteSourceDto extends PartialType(CreateNoteSourceDto) {}
