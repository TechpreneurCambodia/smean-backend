import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { NoteSourceService } from './note-source.service';
import { CreateNoteSourceDto } from './dto/create-note-source.dto';
import { UpdateNoteSourceDto } from './dto/update-note-source.dto';

@Controller('note-sources')
@UsePipes(new ValidationPipe({ transform: true }))
export class NoteSourceController {
  constructor(private readonly noteSourceService: NoteSourceService) {}

  @Post()
  create(@Body() createNoteSourceDto: CreateNoteSourceDto) {
    return this.noteSourceService.create(createNoteSourceDto);
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
