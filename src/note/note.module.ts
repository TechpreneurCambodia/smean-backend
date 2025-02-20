import { Module } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { NoteSource } from 'src/note-source/entities/note-source.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './entities/note.entity';
import { NoteTranscription } from 'src/note-transcription/entities/note-transcription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Note, NoteSource, NoteTranscription])],
  controllers: [NoteController],
  providers: [NoteService],
  exports: [NoteService],
})
export class NoteModule {}
