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
      const durationInSeconds = typeof duration === 'number' ? duration.toFixed(2) : '0';
      return {
        message: 'Audio file uploaded successfully',
        filePath: `/uploads/audio/${file.filename}`,
        originalName: file.originalname.split('.')[0],
        size: file.size,
        mimetype: file.mimetype,
        duration: `${durationInSeconds}s`
      };
    } catch (error) {
      this.logger.error(`Error saving file info: ${error.message}`);
      throw new Error('Failed to extract audio duration');
    }
  }
  async splitAndUpload(noteId: string, filePath: string, uploadUrl: string, chunkDurationReq: number): Promise<AudioSegment[]> {
    const chunkDir = './uploads/chunks';
    const segments: AudioSegment[] = [];
    if (!existsSync(chunkDir)) {
      mkdirSync(chunkDir, { recursive: true });
    }
  
    // 🛑 Convert WebM to WAV first, if needed
    let processedFilePath = filePath;
    if (filePath.endsWith('.webm')) {
      const wavFilePath = filePath.replace('.webm', '.wav');
      await this.convertWebMToWav(filePath, wavFilePath);
      processedFilePath = wavFilePath;
    }
  
    let chunkDuration = chunkDurationReq;
    console.log('chunkDuration', chunkDuration);
    let startTime = 0;
    let chunkIndex = 0;
    const uploadResults: { chunk: string; response: any }[] = [];
  
    const totalDuration = await this.getAudioDuration(processedFilePath);
    const uploadPromises: Promise<any>[] = [];
  
    while (startTime < totalDuration) {
      const chunkPath = `${chunkDir}/chunk-${chunkIndex}.wav`;
  
      const chunkPromise = new Promise(async (resolve, reject) => {
        try {
          await new Promise((resolve, reject) => {
            ffmpeg(processedFilePath)
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
  
  async convertWebMToWav(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('wav')
        .audioCodec('pcm_s16le')
        .audioChannels(1)
        .audioFrequency(16000)
        .on('end', () => {
          this.logger.log(`Converted WebM to WAV: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          this.logger.error(`Conversion error: ${err.message}`);
          reject(err);
        })
        .save(outputPath);
    });
  }
}
