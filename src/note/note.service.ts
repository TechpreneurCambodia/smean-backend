import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { User } from 'src/user/entities/user.entity';
import { NoteDto } from './dto/note-response.dto';

@Injectable()
export class NoteService {
  noteTranscriptionRepository: any;
  constructor(
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userId: string, createNoteDto: CreateNoteDto): Promise<Note> {
    const user = await this.userRepository.findOne({ where: { id: userId }, select: ['id', 'firstName', 'lastName', 'email'] });
    if (!user) throw new NotFoundException('User not found');

    const note = this.noteRepository.create({ ...createNoteDto, user });
    return this.noteRepository.save(note);
  }

  async findAll(): Promise<any[]> {
    const notes = await this.noteRepository.find({ relations: ['user', 'labels'] });
    return notes.map(note => ({
      ...note,
      user: {
        id: note.user.id,
        firstName: note.user.firstName,
        lastName: note.user.lastName,
        email: note.user.email,
      },
    }));
  }

  async findOne(id: string): Promise<any> {
    const note = await this.noteRepository.findOne({ where: { id }, relations: ['user', 'labels'] });
    if (!note) throw new NotFoundException('Note not found');
    return {
      ...note,
      user: {
        id: note.user.id,
        firstName: note.user.firstName,
        lastName: note.user.lastName,
        email: note.user.email,
      },
    };
  }

  async getNoteSummary(id: string): Promise<CreateNoteDto> {
    const note = await this.noteRepository.findOne({ where: { id } });
    if (!note) {
      throw new Error('Note not found');
    }

    return {
      id: note.id,
      title: note.title,
      summary: note.summary,
    };
  }

  async getNoteTranscriptions(id: string): Promise<NoteDto[]> {
    const transcriptions = await this.noteTranscriptionRepository.find({ where: { note: { id } } });
    return transcriptions.map(transcription => ({
      startAt: transcription.startAt,
      endAt: transcription.endAt,
      content: transcription.content,
      summary: transcription.summary,
      filePath: transcription.filePath,
    }));
  }

  async update(id: string, updateNoteDto: UpdateNoteDto): Promise<Note> {
    const note = await this.noteRepository.findOne({ where: { id } });
    if (!note) throw new NotFoundException('Note not found');

    Object.assign(note, updateNoteDto);
    return this.noteRepository.save(note);
  }

  async remove(id: string): Promise<void> {
    const note = await this.noteRepository.findOne({ where: { id } });
    if (!note) throw new NotFoundException('Note not found');

    await this.noteRepository.delete(id);
  }

  async markNoteAsFavorite(id: string): Promise<Note> {
    const note = await this.noteRepository.findOne({ where: { id } });
    if (!note) throw new NotFoundException('Note not found');

    note.isFavorite = !note.isFavorite;
    return this.noteRepository.save(note);
  }
}
