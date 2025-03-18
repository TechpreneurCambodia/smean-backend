import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { NoteSourceService } from './note-source.service';
import { CreateNoteSourceDto } from './dto/create-note-source.dto';
import { UpdateNoteSourceDto } from './dto/update-note-source.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateNoteDto } from 'src/note/dto/create-note.dto';

@Controller('note-sources')
@UsePipes(new ValidationPipe({ transform: true }))
export class NoteSourceController {
  constructor(private readonly noteSourceService: NoteSourceService) {}
  
  @Post()
  @UseGuards(AuthGuard)
  create(@Request() req, @Body() createNoteSourceDto: CreateNoteSourceDto) {
    const userId = req.user.id;
    const noteSource = this.noteSourceService.create(createNoteSourceDto, userId);
    return noteSource;
  }

  @Get()
  findAll() {
    return this.noteSourceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.noteSourceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNoteSourceDto: UpdateNoteSourceDto) {
    return this.noteSourceService.update(+id, updateNoteSourceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.noteSourceService.remove(+id);
  }
}
