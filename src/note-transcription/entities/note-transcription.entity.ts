import { Note } from 'src/note/entities/note.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';

@Entity('note_transcriptions')
export class NoteTranscription {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Note, (note) => note.id)
  note: Note;

  @Column({name:'start_at', length: 125 })
  startAt: string;

  @Column({name: 'end_at', length: 125 })
  endAt: string;

  @Column({ length: 125 })
  content: string;

  @CreateDateColumn({name: 'created_at'})
  createdAt: Date;

  @CreateDateColumn({name: 'updated_at'})
  updatedAt: Date;
}