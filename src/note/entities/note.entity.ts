import { NoteSource } from 'src/note-source/entities/note-source.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => NoteSource, noteSource => noteSource.note, { cascade: true, nullable: true })
  @JoinColumn({ name: 'note_source_id' })
  noteSource: NoteSource;

  @ManyToOne(() => User, user => user.notes)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 125 })
  title: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ name: 'favorited_at', type: 'timestamp', nullable: true })
  favoritedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @CreateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
