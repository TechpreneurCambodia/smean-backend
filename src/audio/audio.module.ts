import { Module } from '@nestjs/common';
import { AudioService } from './audio.service';
import { AudioController } from './audio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { NoteTranscription } from 'src/note-transcription/entities/note-transcription.entity';
import { UserModule } from 'src/user/user.module';
import { NoteSource } from 'src/note-source/entities/note-source.entity';
import { Note } from 'src/note/entities/note.entity';
import { HttpModule } from '@nestjs/axios';
import { NoteSourceModule } from 'src/note-source/note-source.module';

@Module({
  imports: [TypeOrmModule.forFeature(
    [User, Note, NoteSource, NoteTranscription]),
    UserModule,
    HttpModule,
    NoteSourceModule,
  ],
  controllers: [AudioController],
  providers: [
    AudioService,
  ],
  exports: [AudioService],
})
export class AudioModule { }
