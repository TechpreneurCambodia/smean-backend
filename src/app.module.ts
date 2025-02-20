import { Module } from '@nestjs/common';
import { UserController } from './user/user.controller';
import { AuthController } from './auth/auth.controller';
import { AudioController } from './audio/audio.controller';
import { UserModule } from './user/user.module';
import { NoteModule } from './note/note.module';
import { NoteSourceModule } from './note-source/note-source.module';
import { NoteTranscriptionModule } from './note-transcription/note-transcription.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AudioModule } from './audio/audio.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { FILE_UPLOAD_DIR } from './constants';
@Module({
  imports: [
    AudioModule,
    AuthModule,
    MulterModule.register({
      dest: FILE_UPLOAD_DIR,
      limits: { fileSize: 1000 * 1000 * 10 },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AudioModule,
    UserModule,
    NoteModule,
    NoteSourceModule,
    NoteTranscriptionModule,
  ],
  controllers: [AppController, UserController, AuthController, AudioController],
  providers: [AppService],
})
export class AppModule {}