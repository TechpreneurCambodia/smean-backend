import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AudioService } from './audio.service';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthGuard } from 'src/auth/auth.guard';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import * as FormData from 'form-data';
import { Readable } from 'stream';
import { NoteSourceService } from 'src/note-source/note-source.service';
import { CreateNoteSourceDto } from 'src/note-source/dto/create-note-source.dto';
import { CreateNoteDto } from 'src/note/dto/create-note.dto';

@Controller('audio')
export class AudioController {
  constructor(
    private readonly audioService: AudioService,
    private readonly httpService: HttpService,
    private readonly noteSourceService: NoteSourceService,

  ) { }

  // this endpoint upload to the flask api
  @HttpCode(HttpStatus.OK)
  @Post('upload')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', 'uploads', 'audio'),
        filename: (_req, file, cb) => {
          const fileExt = extname(file.originalname);
          const fileName = `${uuidv4()}${fileExt}`;
          cb(null, fileName);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('audio/')) {
          return cb(
            new BadRequestException('Only audio files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadAudio(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {

    if (!file) {
      throw new BadRequestException('No file to upload');
    }

    const fileExt = extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const formData = new FormData();

    // Convert buffer to stream
    const fileStream = new Readable();
    fileStream.push(file.buffer);
    fileStream.push(null);

    formData.append('file', fileStream, {
      filename: fileName,
      contentType: file.mimetype,
    });

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${process.env.MODEL_URL}/upload`, formData, {
          headers: {
            ...formData.getHeaders(),
          },
        }),
      );
    
      const fileInfo = await this.audioService.saveFileInfo(file);
      const createNoteSourceDto: CreateNoteSourceDto = {
        content: response.data.content,
        noteType: response.data.noteType,
        sourceUrl: fileInfo.filePath,
        summary: response.data.summary,
        title: response.data.title,
        transcription: response.data.transcription,
      };
    
      const note = await this.noteSourceService.create(createNoteSourceDto, req.user.id);
      console.log('Created note:', note);
      return {
        message: 'Audio file uploaded successfully',
        note: note
      };
    } catch (error) {
      console.error('Error response:', error.response?.data || error.message);
      return { message: 'Error uploading file', error: error.message };
    }
  }
}
