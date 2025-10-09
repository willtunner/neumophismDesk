// models/annotation.model.ts
export interface Annotation {
  id: string;
  videoId: string;
  timestamp: number; // segundos
  note: string;
  createdAt: Date;
}