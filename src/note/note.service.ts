import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { User } from 'src/user/entities/user.entity';
import { NoteTranscriptionsDto } from './dto/note-transcriptions.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class NoteService {

  constructor(
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(userId: string, createNoteDto: CreateNoteDto): Promise<Note> {
    const user = await this.userRepository.findOne({ where: { id: userId }, select: ['id', 'firstName', 'lastName', 'email'] });
    if (!user) throw new NotFoundException('User not found');

    const note = this.noteRepository.create({ ...createNoteDto, user });
    return this.noteRepository.save(note);
  }

  async findAll(userId: string, paginationDto: PaginationDto): Promise<any[]> {
    const { limit, offset = 0, sortBy = 'updatedAt', sortOrder = 'ASC' } = paginationDto;

    const findOptions: any = {
      where: { user: { id: userId } },
      relations: ['labels', 'noteSource'],
      skip: offset,
      order: {
        [sortBy]: sortOrder,
      },
    };

    if (limit && limit > 0) {
      findOptions.take = limit;
    }

    const notes = await this.noteRepository.find(findOptions);
    return notes;
  }

  async findOne(userId: string, id: string): Promise<any> {
    const note = await this.noteRepository.findOne({ where: { id, user: { id: userId } }, relations: ['noteSource', 'labels'] });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async getNoteSummary(userId: string, id: string): Promise<CreateNoteDto> {
    const note = await this.noteRepository.findOne({ where: { id, user: { id: userId } } });
    if (!note) {
      throw new Error('Note not found');
    }

    return note;
  }

  async getNoteTranscriptions(userId: string, id: string): Promise<{ note: any, transcriptions: NoteTranscriptionsDto[] }> {
    const note = await this.noteRepository.findOne({ where: { id, user: { id: userId } }, relations: ['transcriptions'] });
    if (!note) throw new NotFoundException('Note not found');

    return { note: note, transcriptions: note.transcriptions };
  }

  async update(userId: string, id: string, updateNoteDto: UpdateNoteDto): Promise<Note> {
    const note = await this.noteRepository.findOne({ where: { id, user: { id: userId } } });
    if (!note) throw new NotFoundException('Note not found');

    Object.assign(note, updateNoteDto);
    return this.noteRepository.save(note);
  }

  async remove(userId: string, id: string): Promise<void> {
    const note = await this.noteRepository.findOne({ where: { id, user: { id: userId } } });
    if (!note) throw new NotFoundException('Note not found');

    await this.noteRepository.delete(id);
  }

  async markNoteAsFavorite(userId: string, id: string): Promise<Note> {
    const note = await this.noteRepository.findOne({ where: { id, user: { id: userId } } });
    if (!note) throw new NotFoundException('Note not found');

    note.isFavorite = !note.isFavorite;
    return this.noteRepository.save(note);
  }
}
