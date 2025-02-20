import { Injectable } from '@nestjs/common';
import { CreateNoteSourceDto } from './dto/create-note-source.dto';
import { UpdateNoteSourceDto } from './dto/update-note-source.dto';
import { NoteSource } from './entities/note-source.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NoteSourceService {
  constructor(
    @InjectRepository(NoteSource)
    private readonly noteSourceRepository: Repository<NoteSource>,
  ) { }

  async create(createNoteSourceDto: CreateNoteSourceDto) {
    if (!createNoteSourceDto.noteType) {
      throw new Error('note_type is required');
    }
    const noteSource = this.noteSourceRepository.create(createNoteSourceDto);
    return await this.noteSourceRepository.save(noteSource);
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
