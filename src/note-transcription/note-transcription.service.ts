import { Injectable } from '@nestjs/common';
import { CreateNoteTranscriptionDto } from './dto/create-note-transcription.dto';
import { UpdateNoteTranscriptionDto } from './dto/update-note-transcription.dto';

@Injectable()
export class NoteTranscriptionService {
  create(createNoteTranscriptionDto: CreateNoteTranscriptionDto) {
    return 'This action adds a new noteTranscription';
  }

  findAll() {
    return `This action returns all noteTranscription`;
  }

  findOne(id: number) {
    return `This action returns a #${id} noteTranscription`;
  }

  update(id: number, updateNoteTranscriptionDto: UpdateNoteTranscriptionDto) {
    return `This action updates a #${id} noteTranscription`;
  }

  remove(id: number) {
    return `This action removes a #${id} noteTranscription`;
  }
}
