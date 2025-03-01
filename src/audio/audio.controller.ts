import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
  HttpCode,
  HttpStatus,
  NotFoundException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AudioService } from './audio.service';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthGuard } from 'src/auth/auth.guard';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import * as FormData from 'form-data';
import { NoteSourceService } from 'src/note-source/note-source.service';
import { CreateNoteSourceDto } from 'src/note-source/dto/create-note-source.dto';
import { createReadStream } from 'fs';

@Controller('audio')
export class AudioController {
  private uploadUrl = `${process.env.MODEL_URL}/upload`;
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
    formData.append('file', createReadStream(file.path), fileName);

    try {
      const response = await lastValueFrom(
        this.httpService.post(`${process.env.MODEL_URL}/upload`, formData, {
          headers: formData.getHeaders(),
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
      throw new NotFoundException('Error uploading file');
      // return { message: 'Error uploading file', error: error.message };
    }
  }

  // this endpoint split the audio file and upload to the flask api
  @Post('split-and-upload')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', 'uploads', 'audio'),
        filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
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
    }),
  )
  async splitAndUpload(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const chunkDuration = Number(req.body.chunkDuration);
    if (!file) {
      return { message: 'No file uploaded' };
    }

    if (!chunkDuration) {
      return { message: 'No segment duration provided' };
    }
    // the chunk is in seconds format
    if (chunkDuration != 60 && chunkDuration != 180 && chunkDuration != 300) {
      throw new BadRequestException('Invalid segment duration. Choose either 1, 3 or 5 minutes.');
    }
    // ensure note is rollback if the generated transcripts is failed
    try {
      const fileInfo = await this.audioService.saveFileInfo(file);
      const createNoteSourceDto: CreateNoteSourceDto = {
        content: "",
        noteType: "audio",
        sourceUrl: fileInfo.filePath,
        summary: "",
        title: "Audio",
        transcription: "",
      };

      const note = await this.noteSourceService.create(createNoteSourceDto, req.user.id);
      const results = await this.audioService.splitAndUpload(note.data.id, file.path, this.uploadUrl, chunkDuration);
      console.log('Created note:', note);

      return {
        message: 'Audio split and uploaded',
        note: note.data,
        transcriptions: results
      };
    } catch (error) {
      console.error('Error splitting and uploading audio:', error.message);
      throw new NotFoundException('Error splitting and uploading audio');
    }
  }
}
