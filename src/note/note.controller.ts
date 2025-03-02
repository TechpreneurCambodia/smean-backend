import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, NotFoundException } from '@nestjs/common';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Note } from './entities/note.entity';
import { NoteDto } from './dto/note-response.dto';

@Controller('notes')
@UseGuards(AuthGuard)
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  async create(@Request() req, @Body() createNoteDto: CreateNoteDto) {
    try {
      console.log("Received Request User:", req.user.userId);
      console.log("Received Body:", createNoteDto);

      if (!req.user || !req.user.id) {
        throw new Error("User not authenticated");
      }

      const note = await this.noteService.create(req.user.id, createNoteDto);
      const { user, ...noteWithoutUser } = note;
      return { message: "Note created successfully", note: { ...noteWithoutUser, user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email } } };
    } catch (error) {
      console.error("❌ Error in createNote:", error);
      throw error;
    }
  }

  @Get()
  async findAll() {
    const notes = await this.noteService.findAll();
    return { message: "Notes retrieved successfully", notes };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const note = await this.noteService.findOne(id);
    return { message: "Note retrieved successfully", note };
  }

  @Get(':id')
  async getNoteById(@Param('id') id: string): Promise<Note> {
    const note = await this.noteService.findOne(id);
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    return note;
  }

  @Get(':id')
  async getNoteSummary(@Param('id') id: string): Promise<{ message: string, note: CreateNoteDto }> {
    const note = await this.noteService.getNoteSummary(id);
    return { message: "Note retrieved successfully", note };
  }

  @Get(':id/note-transcriptions')
  async getNoteTranscriptions(@Param('id') id: string): Promise<NoteDto[]> {
    return this.noteService.getNoteTranscriptions(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
    return this.noteService.update(id, updateNoteDto);
  }

  @Patch(':id/favorite')
  async markNoteAsFavorite(@Param('id') id: string): Promise<Note> {
    return this.noteService.markNoteAsFavorite(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.noteService.remove(id);
  }
}
