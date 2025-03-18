export class NoteTranscriptionsDto {
    id: string;
    startAt: number;    
    endAt: number;  
    filePath: string;
    content: string;
    summary?: string;
    createdAt: Date;
    updatedAt: Date;
}

