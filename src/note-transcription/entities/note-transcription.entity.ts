import { Note } from 'src/note/entities/note.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';

@Entity('note_transcriptions')
export class NoteTranscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Note, note => note.transcriptions, { onDelete: 'CASCADE' })
  note: Note;

  @Column({name:'start_at', default: 0 })
  startAt: number;

  @Column({name: 'end_at' , default: 0})
  endAt: number;

  @Column({name: 'file_path', length: 255, nullable: true})
  filePath: string;
  
  @Column({ name: 'content', type: 'text' , nullable: true})
  content: string;

  @Column({ name: 'summary', type: 'text', nullable: true })
  summary?: string;

  @CreateDateColumn({name: 'created_at'})
  createdAt: Date;

  @CreateDateColumn({name: 'updated_at'})
  updatedAt: Date;
}