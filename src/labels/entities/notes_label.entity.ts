
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, JoinColumn } from 'typeorm';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Note } from 'src/note/entities/note.entity';
import { Label } from './label.entity';

Entity('notes_labels')
export class NoteLabel {
    @Column({ type: 'uuid', name: 'note_id' })
    noteId: string;

    @Column({ type: 'uuid', name: 'label_id' })
    labelId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @CreateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Note, (note) => note.labels)
    @JoinColumn({ name: 'note_id', referencedColumnName: 'id' })
    note: Note;

    @ManyToOne(() => Label, (label) => label.notes)
    @JoinColumn({ name: 'label_id', referencedColumnName: 'id' })
    label: Label;
    
}