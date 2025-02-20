import { Module } from '@nestjs/common';
import { NoteTranscriptionService } from './note-transcription.service';
import { NoteTranscriptionController } from './note-transcription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from 'src/note/entities/note.entity';
import { NoteSource } from 'src/note-source/entities/note-source.entity';
import { NoteTranscription } from './entities/note-transcription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Note, NoteSource, NoteTranscription])],
  controllers: [NoteTranscriptionController],
  providers: [NoteTranscriptionService],
  exports: [NoteTranscriptionService],
})
export class NoteTranscriptionModule {}
