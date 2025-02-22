import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class NoteDto {
    @Expose() id: string;
    @Expose() title: string;
    @Expose() summary: string;
    @Expose() createdAt: Date;
    @Expose() updatedAt: Date;
    @Expose() noteSource: {
        id: string;
        title: string;
        content: string;
        noteType: 'audio' | 'video' | 'text';
        sourceUrl: string;
        createdAt: Date;
        transcription: string;
    };
}