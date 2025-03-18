import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { Note } from './entities/note.entity';
import { UserModule } from 'src/user/user.module'; 

@Module({
  imports: [TypeOrmModule.forFeature([Note]), UserModule], 
  controllers: [NoteController],
  providers: [NoteService],
})
export class NoteModule {}
