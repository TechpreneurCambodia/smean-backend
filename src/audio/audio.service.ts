import { Injectable, Logger } from '@nestjs/common';
import { join } from 'path';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffprobeStatic from 'ffprobe-static';
import { HttpService } from '@nestjs/axios';
import * as ffmpegPath from '@ffmpeg-installer/ffmpeg';
import { lastValueFrom } from 'rxjs';
import * as FormData from 'form-data';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteTranscription } from 'src/note-transcription/entities/note-transcription.entity';
export interface AudioSegment {
  startAt: number;
  endAt: number;
  content: string;
  summary?: string;
  filePath: string;
}
@Injectable()
export class AudioService {
  private readonly logger = new Logger(AudioService.name);
  private uploadPath = join(__dirname, '..', '..', 'uploads', 'audio');

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(NoteTranscription)
    private readonly audioSegmentRepository: Repository<NoteTranscription>,
  ) {
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
  async splitAndUpload(noteId: string, filePath: string, uploadUrl: string, chunkDurationReq: number): Promise<AudioSegment[]> {
    const chunkDir = './uploads/chunks';
    const segments: AudioSegment[] = [];
    if (!existsSync(chunkDir)) {
      mkdirSync(chunkDir, { recursive: true });
    }

    let chunkDuration = chunkDurationReq;
    console.log('chunkDuration', chunkDuration);
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
              .on('error', reject)
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
          this.logger.error(`Splitting completed or an error occurred: ${error.message}`);
          reject(error);
        }
      });

      uploadPromises.push(chunkPromise);
      console.log('chunkPromise', chunkPromise);

      const endTime = startTime + Math.min(chunkDuration, totalDuration - startTime);
      segments.push({
        startAt: Math.floor(startTime * 1000), // store as milliseconds
        endAt: Math.floor(endTime * 1000),
        filePath: chunkPath,
        content: "", // Will be updated after upload
      });

      startTime += chunkDuration;
      chunkIndex++;
    }

    const results = await Promise.all(uploadPromises);
    results.forEach((result, index) => {
      if (result) {
        uploadResults.push(result);
        segments[index].content = result.response.content;
        segments[index].summary = result.response.summary;
      }
    });

    const noteTranscriptions = segments.map(segment => ({
      startAt: segment.startAt,
      endAt: segment.endAt,
      content: segment.content,
      filePath: segment.filePath,
      summary: segment.summary,
      note: { id: noteId },
    }));

    await this.audioSegmentRepository.save(noteTranscriptions);
    console.log(segments);
    return segments;
  }
  // async splitAndUpload(filePath: string, uploadUrl: string): Promise<any[]> {
  //   const chunkDir = './uploads/chunks';
  //   if (!existsSync(chunkDir)) {
  //     mkdirSync(chunkDir, { recursive: true });
  //   }

  //   const chunkDuration = 60; // 1 minute
  //   let startTime = 0;
  //   let chunkIndex = 0;
  //   const uploadResults: { chunk: string; response: any }[] = [];

  //   const totalDuration = await this.getAudioDuration(filePath);

  //   while (startTime < totalDuration) {
  //     const chunkPath = `${chunkDir}/chunk-${chunkIndex}.wav`;

  //     try {
  //       await new Promise((resolve, reject) => {
  //         ffmpeg(filePath)
  //           .setStartTime(startTime)
  //           .setDuration(Math.min(chunkDuration, totalDuration - startTime))
  //           .output(chunkPath)
  //           .on('end', resolve)
  //           .on('error', reject)
  //           .run();
  //       });

  //       if (!existsSync(chunkPath)) {
  //         this.logger.warn(`Chunk file does not exist: ${chunkPath}`);
  //         break;
  //       }

  //       const formData = new FormData();
  //       formData.append('file', createReadStream(chunkPath));

  //       const response = await lastValueFrom(
  //         this.httpService.post(uploadUrl, formData, {
  //           headers: formData.getHeaders(),
  //         }),
  //       );

  //       uploadResults.push({ chunk: chunkPath, response: response.data });
  //       startTime += chunkDuration;
  //       chunkIndex++;
  //     } catch (error) {
  //       this.logger.error(`Splitting completed or an error occurred: ${error.message}`);
  //       break;
  //     }
  //   }

  //   return uploadResults;
  // }

}
