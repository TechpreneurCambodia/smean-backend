import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { LabelsService } from './labels.service';
import { CreateLabelDto } from './dto/label.dto';
import { Label } from './entities/label.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { Note } from 'src/note/entities/note.entity';
import { User } from 'src/user/entities/user.entity';

@Controller('labels')
@UseGuards(AuthGuard)
export class LabelsController {
  noteRepository: Note;
  userRepository: User;
  labelRepository: Label;
  constructor(private readonly labelsService: LabelsService) {}


  // Get all labels
  @Get()
  async findAll(): Promise<Label[]> {
    return this.labelsService.findAll();
  }

  // Get a specific label by ID
  @Get(':labelId')
  async findOne(@Param('labelId') labelId: string): Promise<Label> {
    const label = await this.labelsService.findOne(labelId);
    if (!label) {
      throw new NotFoundException(`Label with ID ${labelId} not found`);
    }
    return label;
  }

  // Add a label to a note
  @Post()
  async addLabelToNote(
    @Body() addLabelToNoteDto: { noteId: string; labelId: string }
  ): Promise<{ message: string }> {
    try{
      const { noteId, labelId } = addLabelToNoteDto;
    }
    catch (error) {
      throw new NotFoundException(`Note or Label is invalid`);
    }
    
    await this.labelsService.addLabelToNote(addLabelToNoteDto.noteId, addLabelToNoteDto.labelId);
    return { message: 'Label added to note successfully' };

  }

  @Post(':noteId')
  async createLabelForNote(
    @Req() req,
    @Param('noteId') noteId: string,
    @Body(new ValidationPipe()) createLabelDto: CreateLabelDto
  ): Promise<Label> {
    if (!req.user || !req.user.id) {
      throw new Error('User not authenticated');
    }
    return this.labelsService.createLabelForNote(req.user.id, noteId, createLabelDto);
  }
  // // Remove a label from a note
  // @Delete('remove-from-note')
  // async removeLabelFromNote(
  //   @Body() removeLabelFromNoteDto: { noteId: string; labelId: string }
  // ): Promise<void> {
  //   const { noteId, labelId } = removeLabelFromNoteDto;
  //   return this.labelsService.removeLabelFromNote(noteId, labelId);
  // }

  // Delete a label
  @Delete(':labelId')
  async remove(@Param('labelId') labelId: string): Promise<void> {
    return this.labelsService.removeLabel(labelId);
  }
}
