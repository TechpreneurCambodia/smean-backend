import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [AuthModule,
    TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'kimtry168',
    database: 'tream-kloun',
    autoLoadEntities: true,
    synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
  
})
export class AppModule {}
