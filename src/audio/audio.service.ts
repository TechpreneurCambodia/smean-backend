import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Express } from 'express'; // ✅ Correct import

@Injectable()
export class AudioService {
  private uploadPath = join(__dirname, '..', '..', 'uploads', 'audio');

  constructor() {
    this.ensureUploadPathExists();
  }

  private ensureUploadPathExists() {
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  saveFileInfo(file: Express.Multer.File) { // ✅ Correct type
    if (!file) {
      throw new Error('No file received');
    }

    return {
      message: 'Audio file uploaded successfully',
      filePath: `/uploads/audio/${file.filename}`,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
