import { PartialType } from '@nestjs/swagger';
import { CreateNoteTranscriptionDto } from './create-note-transcription.dto';

export class UpdateNoteTranscriptionDto extends PartialType(CreateNoteTranscriptionDto) {}
