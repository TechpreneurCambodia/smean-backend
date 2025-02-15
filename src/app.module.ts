import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as path from 'path';
import { PassportModule } from '@nestjs/passport';
import { AudioController } from './audio/audio.controller';
import { AudioModule } from './audio/audio.module';
import { MulterModule } from '@nestjs/platform-express';
import { FILE_UPLOAD_DIR } from './constants';
import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    AudioModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PassportModule.register({ session: true }),
    MulterModule.register({
      dest: FILE_UPLOAD_DIR,
      limits: { fieldSize: 1000 * 1000 * 10 },
    }),
  ],
  controllers: [AppController, AudioController],
  providers: [AppService],
})
export class AppModule {}
