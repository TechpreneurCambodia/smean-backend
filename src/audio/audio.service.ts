import { Injectable, Logger } from '@nestjs/common';
import { join } from 'path';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffprobeStatic from 'ffprobe-static';
import { HttpService } from '@nestjs/axios';
import * as ffmpegPath from '@ffmpeg-installer/ffmpeg';
import { lastValueFrom } from 'rxjs';
import * as FormData from 'form-data';

@Injectable()
export class AudioService {
  private readonly logger = new Logger(AudioService.name);
  private uploadPath = join(__dirname, '..', '..', 'uploads', 'audio');

  constructor(private readonly httpService: HttpService) {
    this.ensureUploadPathExists();
    ffmpeg.setFfprobePath(ffprobeStatic.path);
    ffmpeg.setFfmpegPath(ffmpegPath.path);
  }

  private ensureUploadPathExists() {
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  getAudioDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err: any, metadata: { format: { duration: any } }) => {
        if (err) {
          this.logger.error(`Error getting audio duration: ${err.message}`);
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
      this.logger.error(`Error saving file info: ${error.message}`);
      throw new Error('Failed to extract audio duration');
    }
  }

  async splitAndUpload(filePath: string, chunkDuration: number = 180, uploadUrl: string): Promise<any[]> {
    const chunkDir = './uploads/chunks';
    if (!existsSync(chunkDir)) {
      mkdirSync(chunkDir, { recursive: true });
    }

    let startTime = 0;
    let chunkIndex = 0;
    const uploadResults: { chunk: string; response: any }[] = [];

    const totalDuration = await this.getAudioDuration(filePath);
    const uploadPromises: Promise<any>[] = [];

    while (startTime < totalDuration) {
      const chunkPath = `${chunkDir}/chunk-${chunkIndex}.wav`;

      const chunkPromise = new Promise(async (resolve, reject) => {
        try {
          await new Promise((resolve, reject) => {
            ffmpeg(filePath)
              .setStartTime(startTime)
              .setDuration(Math.min(chunkDuration, totalDuration - startTime))
              .output(chunkPath)
              .on('end', resolve)
              .on('error', (err) => {
                this.logger.error(`ffmpeg error: ${err.message}`);
                reject(err);
              })
              .run();
          });

          if (!existsSync(chunkPath)) {
            this.logger.warn(`Chunk file does not exist: ${chunkPath}`);
            return resolve(null);
          }

          const formData = new FormData();
          formData.append('file', createReadStream(chunkPath));

          const response = await lastValueFrom(
            this.httpService.post(uploadUrl, formData, {
              headers: formData.getHeaders(),
            }),
          );

          resolve({ chunk: chunkPath, response: response.data });
        } catch (error) {
          this.logger.error(`Error uploading chunk: ${error.message}`);
          reject(error);
        }
      });

      uploadPromises.push(chunkPromise);
      startTime += chunkDuration;
      chunkIndex++;
    }

    try {
      const results = await Promise.all(uploadPromises);
      results.forEach((result) => {
        if (result) {
          uploadResults.push(result);
        }
      });
    } catch (error) {
      this.logger.error(`Error during upload promises: ${error.message}`);
      this.logger.error('Stack trace:', error.stack);
      throw error;
    }

    this.logger.log(`Upload results: ${JSON.stringify(uploadResults)}`);
    return uploadResults;
  }

  async handleAudioUpload(file: Express.Multer.File, chunkDuration: number = 180) {
    const filePath = join(this.uploadPath, file.filename);
    try {
      const uploadUrl = 'http://localhost:4000/api/audio/split-and-upload';
      const segments = await this.splitAndUpload(filePath, chunkDuration, uploadUrl);
      return {
        message: 'Audio file uploaded and split successfully',
        segments: segments,
      };
    } catch (error) {
      this.logger.error(`Error handling audio upload: ${error.message}`);
      throw new Error('Failed to split audio file');
    }
  }
}
