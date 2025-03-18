import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Label } from './entities/label.entity';
import { Note } from 'src/note/entities/note.entity';
import { CreateLabelDto } from './dto/label.dto';

@Injectable()
export class LabelsService {

  constructor(
    @InjectRepository(Label)
    private readonly labelRepository: Repository<Label>,
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,   
  ){}

  async create(
    userId: string,
    noteId: string,
    createLabelDto: CreateLabelDto
  ): Promise<Label> {
    const note = await this.noteRepository.findOne({
      where: { id: noteId },
      relations: ['labels', 'user'], // Ensure labels are loaded
    });

    if (!note) throw new NotFoundException('Note not found');

    const label = this.labelRepository.create({
      ...createLabelDto,
      notes: [note],
    });

    const savedLabel = await this.labelRepository.save(label);

  // Attach label to note
  note.labels.push(label);
  await this.noteRepository.save(note);

  const foundLabel = await this.labelRepository.findOne({ where: { id: label.id }, relations: ['notes'] });
  if (!foundLabel) throw new NotFoundException('Label not found');
  return foundLabel;
  
  }

  async findAll(): Promise<Label[]> {
    return this.labelRepository.find({ relations: ['notes'] });
  }
  

  async removeLabel(labelId: string): Promise<void> {
    const label = await this.labelRepository.findOne({ where: { id: labelId } });
    if (!label) {
      throw new NotFoundException(`Label with ID "${labelId}" not found`);
    }
    await this.labelRepository.delete(labelId);
  }
  

  async addLabelToNote(noteId: string, labelId: string) {
    const note = await this.noteRepository.findOne({
      where: { id: noteId },
      relations: ['labels'], // ensure 'labels' are loaded
    });
    const label = await this.labelRepository.findOne({ where: { id: labelId } });
    
    if (!note || !label) {
      throw new NotFoundException('Note or Label not found');
    }
  
    if (!note.labels) {
      note.labels = [];
    }
  
    note.labels.push(label);
    await this.noteRepository.save(note);
  }

  async createLabelForNote(
    userId: string,
    noteId: string,
    createLabelDto: CreateLabelDto
  ): Promise<any> {
    const note = await this.noteRepository.findOne({ where: { id: noteId }, relations: ['labels', 'user'] });
    if (!note) throw new NotFoundException('Note not found');

    const label = this.labelRepository.create({ ...createLabelDto, notes: [note] });
    await this.labelRepository.save(label);

    note.labels.push(label);
    await this.noteRepository.save(note);

    return {
      ...label,
      notes: label.notes.map(note => ({
        ...note,
        user: {
          id: note.user.id,
          firstName: note.user.firstName,
          lastName: note.user.lastName,
          email: note.user.email,
        },
      })),
    };
  }
  

  async removeLabelFromNote(noteId: string, labelId: string) {
    const note = await this.noteRepository.findOne({ where: { id: noteId }, relations: ['labels'] });
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    if (note.labels) {
      note.labels = note.labels.filter(label => label.id !== labelId);
    }
    await this.noteRepository.save(note);
  }

  async findOne(labelId: string): Promise<Label> {
    const label = await this.labelRepository.findOne({ where: { id: labelId }, relations: ['notes'] });
    if (!label) {
      throw new NotFoundException(`Label with ID ${labelId} not found`);
    }
    return label;
  }
  
}
