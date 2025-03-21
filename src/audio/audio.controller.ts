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
  NotFoundException,
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
import { DataSource } from 'typeorm';
import { SplitAndUpload } from 'src/note/dto/split-and-upload.dto';

@Controller('audio')
export class AudioController {
  private uploadUrl = `${process.env.MODEL_URL}/upload`; // Ensure this URL is correct
  constructor(
    private readonly audioService: AudioService,
    private readonly httpService: HttpService,
    private readonly noteSourceService: NoteSourceService,
    private readonly dataSource: DataSource,
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
          return cb(new BadRequestException('Only audio files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async splitAndUpload(@UploadedFile() file: Express.Multer.File, @Body() splitAndUpload: SplitAndUpload, @Request() req) {
    let { title, chunkDuration } = splitAndUpload;

    if (!file) {
      return { message: 'No file uploaded' };
    }
    chunkDuration = Number(chunkDuration);

    if (!chunkDuration) {
      chunkDuration = 60;
    }
    if (![60, 180, 300, 600].includes(chunkDuration)) {
      throw new BadRequestException('Invalid segment duration. Choose 1, 3, 5, or 10 minutes.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fileInfo = await this.audioService.saveFileInfo(file);
      const createNoteSourceDto: CreateNoteSourceDto = {
        content: "",
        noteType: "audio",
        sourceUrl: fileInfo.filePath,
        summary: "",
        title: title || file.originalname,
        transcription: "",
      };

      const note = await this.noteSourceService.create(createNoteSourceDto, req.user.id);
      const results = await this.audioService.splitAndUpload(note.data.id, file.path, this.uploadUrl, chunkDuration);
      console.log('Created note:', note);
      await queryRunner.commitTransaction();
      return {
        message: 'Audio split and uploaded',
        note: note.data,
        transcriptions: results,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error splitting and uploading audio:', error.message);
      throw new NotFoundException('Error splitting and uploading audio');
    } finally {
      await queryRunner.release();
    }
  }
}
