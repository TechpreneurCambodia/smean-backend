import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NoteTranscriptionService } from './note-transcription.service';
import { CreateNoteTranscriptionDto } from './dto/create-note-transcription.dto';
import { UpdateNoteTranscriptionDto } from './dto/update-note-transcription.dto';

@Controller('note-transcriptions')
export class NoteTranscriptionController {
  constructor(private readonly noteTranscriptionService: NoteTranscriptionService) {}

  @Post()
  create(@Body() createNoteTranscriptionDto: CreateNoteTranscriptionDto) {
    return this.noteTranscriptionService.create(createNoteTranscriptionDto);
  }

  @Get()
  findAll() {
    return this.noteTranscriptionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.noteTranscriptionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNoteTranscriptionDto: UpdateNoteTranscriptionDto) {
    return this.noteTranscriptionService.update(+id, updateNoteTranscriptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.noteTranscriptionService.remove(+id);
  }
}
