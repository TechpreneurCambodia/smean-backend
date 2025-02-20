import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffprobeStatic from 'ffprobe-static';
import { Express } from 'express';
// import { UploadAudioDto } from './dto/upload-audio.dto';

@Injectable()
export class AudioService {
  private uploadPath = join(__dirname, '..', '..', 'uploads', 'audio');

  constructor() {
    this.ensureUploadPathExists();
    ffmpeg.setFfprobePath(ffprobeStatic.path);
  }

  private ensureUploadPathExists() {
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  getAudioDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err: any, metadata: { format: { duration: any; }; }) => {
        if (err) {
          return reject(err);
        }
        resolve(metadata.format.duration || 0);
      });
    });
  }

  async saveFileInfo(file: Express.Multer.File) { 
    if (!file) {
      throw new Error('No file received');
    }

    const filePath = join(this.uploadPath, file.filename);
    try {
      const duration = await this.getAudioDuration(filePath);
      return {
        message: 'Audio file uploaded successfully',
        filePath: `/uploads/audio/${file.filename}`,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        duration: duration ? parseFloat(duration.toFixed(2)) : 0 + 's',
      };
    } catch (error) {
      console.error('Error extracting duration:', error);
      throw new Error('Failed to extract audio duration');
    }
  }
}
