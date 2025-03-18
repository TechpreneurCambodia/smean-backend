import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateNoteSourceDto } from './dto/create-note-source.dto';
import { UpdateNoteSourceDto } from './dto/update-note-source.dto';
import { NoteSource } from './entities/note-source.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { Note } from 'src/note/entities/note.entity';
import { UserService } from 'src/user/user.service';
import { plainToInstance } from 'class-transformer';
import { NoteDto } from 'src/note/dto/note-response.dto';

@Injectable()
export class NoteSourceService {
  constructor(
    @InjectRepository(NoteSource)
    private readonly noteSourceRepository: Repository<NoteSource>,
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) { }

  async create(createNoteSourceDto: CreateNoteSourceDto, userId: string) {
    if (!createNoteSourceDto.noteType) {
      throw new Error('note_type is required');
    }
    const noteSource = this.noteSourceRepository.create(createNoteSourceDto);
    const note = new Note();
    note.title = createNoteSourceDto.title;
    note.summary = createNoteSourceDto.summary;
    note.noteSource = noteSource;
    note.user = await this.userService.findOne(userId);
    note.createdAt = new Date();
    note.updatedAt = new Date();

    const newNote = await this.noteRepository.save(note);
    await this.noteSourceRepository.save(noteSource);
    return {
      message: "Successfully created",
      data: plainToInstance(NoteDto, newNote),
      statusCode: HttpStatus.CREATED
    };
  }

  async generateText(user: User) {
    return await this.authService.getMe(user);
  }

  async findAll(): Promise<NoteSource[]> {
    const noteSources = await this.noteSourceRepository.find();
    return noteSources;
  }

  findOne(id: number) {
    return `This action returns a #${id} noteSource`;
  }

  update(id: number, updateNoteSourceDto: UpdateNoteSourceDto) {
    return `This action updates a #${id} noteSource`;
  }

  remove(id: number) {
    return `This action removes a #${id} noteSource`;
  }
}
