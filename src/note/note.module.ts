import { Module } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './entities/note.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Note, User])],
  controllers: [NoteController],
  providers: [NoteService],
  exports: [TypeOrmModule, NoteService],
})
export class NoteModule {}
