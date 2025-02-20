import { Note } from 'src/note/entities/note.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';

@Entity('note_sources')
export class NoteSource {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name:'note_type', type: 'enum', enum: ['audio', 'video', 'text'] })
  noteType: string;

  @Column({ name:'source_url', length: 125 })
  sourceUrl: string;

  @Column({ name:'transcription', type: 'text' })
  transcription: string;

  @CreateDateColumn({name: 'created_at'})
  createdAt: Date;

  @OneToOne(() => Note, { cascade: true, nullable: true })
  @JoinColumn()
  note: Note;
}
