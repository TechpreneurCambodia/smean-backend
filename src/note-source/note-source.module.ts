import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteSourceService } from './note-source.service';
import { NoteSourceController } from './note-source.controller';
import { NoteSource } from './entities/note-source.entity';
import { Note } from 'src/note/entities/note.entity';
import { NoteTranscription } from 'src/note-transcription/entities/note-transcription.entity';
import { AuthService } from 'src/auth/auth.service';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/entities/user.entity';
import { AudioService } from 'src/audio/audio.service';
import { NoteService } from 'src/note/note.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Note, NoteSource, NoteTranscription]), UserModule],
  controllers: [NoteSourceController],
  providers: [NoteSourceService, AuthService, AudioService, NoteService],
  exports: [NoteSourceService],
})
export class NoteSourceModule { }
