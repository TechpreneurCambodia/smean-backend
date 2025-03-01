import { Label } from 'src/labels/entities/label.entity';
import { NoteSource } from 'src/note-source/entities/note-source.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToOne, JoinColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ default: false })
  isFavorite: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Label, (label) => label.notes)
  @JoinTable()
  labels: Label[];

}
