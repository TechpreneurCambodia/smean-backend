import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, NotFoundException } from '@nestjs/common';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Note } from './entities/note.entity';
import { NoteDto } from './dto/note-response.dto';
import { NoteTranscriptionsDto } from './dto/note-transcriptions.dto';

@Controller('notes')
@UseGuards(AuthGuard)
export class NoteController {
  constructor(private readonly noteService: NoteService) { }

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
  async findAll(@Request() req) {
    const notes = await this.noteService.findAll(req.user.id);
    return { message: "Notes retrieved successfully", notes };
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const note = await this.noteService.findOne(req.user.id, id);
    return { message: "Note retrieved successfully", note };
  }

  @Get(':id/summary')
  async getNoteSummary(@Request() req, @Param('id') id: string): Promise<{ message: string, note: CreateNoteDto }> {
    const note = await this.noteService.getNoteSummary(req.user.id, id);
    return { message: "Note retrieved successfully", note };
  }

  @Get(':id/note-transcriptions')
  async getNoteTranscriptions(@Request() req, @Param('id') id: string): Promise<{ message: string, note: any, data: NoteTranscriptionsDto[] }> {
    const { note, transcriptions } = await this.noteService.getNoteTranscriptions(req.user.id, id);
    return {
      message: "Get Transcriptions successfully",
      note: {
        id: note.id,
        title: note.title,
        summary: note.summary,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      },
      data: transcriptions
    };
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
    return this.noteService.update(req.user.id, id, updateNoteDto);
  }

  @Patch(':id/favorite')
  async markNoteAsFavorite(@Request() req, @Param('id') id: string): Promise<Note> {
    return this.noteService.markNoteAsFavorite(req.user.id, id);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.noteService.remove(req.user.id, id);
  }
}
