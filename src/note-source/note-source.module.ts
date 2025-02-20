import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteSourceService } from './note-source.service';
import { NoteSourceController } from './note-source.controller';
import { NoteSource } from './entities/note-source.entity';
import { Note } from 'src/note/entities/note.entity';
import { NoteTranscription } from 'src/note-transcription/entities/note-transcription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Note, NoteSource, NoteTranscription])],
  controllers: [NoteSourceController],
  providers: [NoteSourceService],
  exports: [NoteSourceService],
})
export class NoteSourceModule {}
