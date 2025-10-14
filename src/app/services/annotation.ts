// services/annotation.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Annotation } from '../models/annotation.model';

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {
  private annotations: Annotation[] = [];
  private annotationsSubject = new BehaviorSubject<Annotation[]>([]);
  public annotations$ = this.annotationsSubject.asObservable();

  addAnnotation(annotation: Omit<Annotation, 'id' | 'created'>): void {
    const newAnnotation: Annotation = {
      ...annotation,
      id: this.generateId(),
      created: new Date()
    };
    
    this.annotations.push(newAnnotation);
    this.annotationsSubject.next([...this.annotations]);
  }

  getAnnotationsByVideo(videoId: string): Annotation[] {
    return this.annotations.filter(ann => ann.videoId === videoId);
  }

  deleteAnnotation(id: string): void {
    this.annotations = this.annotations.filter(ann => ann.id !== id);
    this.annotationsSubject.next([...this.annotations]);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
