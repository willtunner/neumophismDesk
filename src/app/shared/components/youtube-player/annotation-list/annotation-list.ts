// components/annotation-list/annotation-list.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Annotation } from '../../../../models/annotation.model';

@Component({
  selector: 'app-annotation-list',
  imports: [CommonModule],
  templateUrl: './annotation-list.html',
  styleUrl: './annotation-list.css'
})
export class AnnotationList {
@Input() annotations: Annotation[] = [];
  @Output() seekTo = new EventEmitter<number>();
  @Output() delete = new EventEmitter<string>();

  onAnnotationClick(annotation: Annotation) {
    this.seekTo.emit(annotation.timestamp);
  }

  deleteAnnotation(id: string, event: Event) {
    event.stopPropagation();
    this.delete.emit(id);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
