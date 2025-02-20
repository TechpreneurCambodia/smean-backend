import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AudioModule } from './audio/audio.module';
import { UserController } from './user/user.controller';
import { AuthController } from './auth/auth.controller';
import { AudioController } from './audio/audio.controller';
import { UserModule } from './user/user.module';
import { NoteModule } from './note/note.module';
import { NoteSourceModule } from './note-source/note-source.module';
import { NoteTranscriptionModule } from './note-transcription/note-transcription.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
@Module({
  imports: [
    AuthModule,
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