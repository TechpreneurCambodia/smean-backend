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
  InternalServerErrorException,
  Body
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
  private uploadUrl = `${process.env.MODEL_URL}/upload`; // Ensure this URL is correct
  constructor(
    private readonly audioService: AudioService,
    private readonly httpService: HttpService,
    private readonly noteSourceService: NoteSourceService,
  ) { }

  // this endpoint upload to the flask api
  @HttpCode(HttpStatus.OK)
  @Post('upload')
  // @UseGuards(AuthGuard) // Apply authentication middleware
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
        this.httpService.post(this.uploadUrl, formData, {
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
      console.error('Stack trace:', error.stack);
      throw new InternalServerErrorException('Error uploading file');
    }
  }

  // this endpoint split the audio file and upload to the flask api
  @Post('split-and-upload')
  // @UseGuards(AuthGuard) // Apply authentication middleware
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
      }),
    }),
  )
  async splitAndUpload(
    @UploadedFile() file: Express.Multer.File,
    @Body('segmentDuration') segmentDuration: number = 180, // Default to 3 minutes
    @Request() req
  ) {
    if (!file) {
      return { message: 'No file uploaded' };
    }

    try {
      console.log(`Splitting file with segment duration: ${segmentDuration}`);
      const results = await this.audioService.splitAndUpload(file.path, segmentDuration, this.uploadUrl);
      console.log('Split and upload results:', results);
      return { message: 'Audio split and uploaded', results };
    } catch (error) {
      console.error('Error in split-and-upload:', error.message);
      console.error('Stack trace:', error.stack);
      throw new InternalServerErrorException('Error splitting and uploading file');
    }
  }
}
