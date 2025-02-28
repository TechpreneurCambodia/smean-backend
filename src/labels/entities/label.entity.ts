import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Note } from 'src/note/entities/note.entity';

@Entity()
export class Label {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Note, (note) => note.labels)
  notes: Note[];
}
