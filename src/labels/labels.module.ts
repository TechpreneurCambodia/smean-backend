import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Label } from './entities/label.entity';
import { Note } from 'src/note/entities/note.entity';
import { LabelsService } from './labels.service';
import { LabelsController } from './labels.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Label, Note])],
    controllers: [LabelsController],
    providers: [LabelsService],
    exports: [LabelsService],
})
export class LabelsModule {}
