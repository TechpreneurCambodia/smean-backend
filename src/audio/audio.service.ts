import { Injectable, Logger } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class AudioService {
  private readonly logger = new Logger(AudioService.name);
  private uploadPath = join(__dirname, '..', '..', 'uploads', 'audio');

  constructor() {
    this.ensureUploadPathExists();
  }

  private ensureUploadPathExists() {
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
      this.logger.log(`Created upload directory at ${this.uploadPath}`);
    }
  }

  saveFileInfo(file: Express.Multer.File) {
    
    if (!file) {
      throw new Error('No file received');
    }

    this.logger.log(`Saving file to ${file.path}`);

    return {
      message: 'Audio file uploaded successfully',
      filePath: file.path,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
