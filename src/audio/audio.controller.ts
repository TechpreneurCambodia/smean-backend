import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AudioService } from './audio.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Express } from 'express'; // ✅ Correct import

@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Post('upload-audio')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/audio',
        filename: (req, file, cb) => {
          const fileExt = extname(file.originalname);
          const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
          cb(null, fileName);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('audio/')) {
          return cb(new Error('Only audio files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadAudio(
    @UploadedFile() file: Express.Multer.File,
    @Body() _uploadAudioDto: any,
  ) {
    console.log('Uploaded file:', file);

    if (!file) {
      return { msg: 'No file uploaded' };
    }

    return this.audioService.saveFileInfo(file);
  }
}
