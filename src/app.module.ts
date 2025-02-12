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

@Module({
  imports: [
    AuthModule,
    AudioModule,
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
        // url: configService.get<string>('DATABASE_URL'), 
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    PassportModule.register({ session: true }),
    AudioModule,
  ],
  controllers: [AppController, AudioController],
  providers: [AppService],
})
export class AppModule {}
