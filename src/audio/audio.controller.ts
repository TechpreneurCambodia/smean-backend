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
import { Express } from 'express';
import { FILE_UPLOAD_DIR } from 'src/constants';
import { UploadAudioDto } from './dto/upload-audio.dto';
import { v4 as uuidv4 } from 'uuid';

@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Post('upload-audio')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: FILE_UPLOAD_DIR,
        filename: (_req, file, cb) => {
          const fileExt = extname(file.originalname);
          const fileName = `${uuidv4()}${fileExt}`;
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
    @Body() _uploadAudioDto: UploadAudioDto,
  ) {
    console.log('Uploaded file:', file);

    if (!file) {
      return { msg: 'No file uploaded' };
    }

    return this.audioService.saveFileInfo(file);
  }
}
