// components/annotation-form/annotation-form.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-annotation-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './annotation-form.html',
  styleUrl: './annotation-form.css'
})
export class AnnotationForm {
@Input() timestamp: number = 0;
  @Input() videoId: string = '';
  @Output() annotationSaved = new EventEmitter<{timestamp: number, note: string}>();
  @Output() formClosed = new EventEmitter<void>();

  note: string = '';
  showForm: boolean = false;

  ngOnChanges() {
    if (this.timestamp > 0) {
      this.showForm = true;
    }
  }

  saveAnnotation() {
    if (this.note.trim()) {
      this.annotationSaved.emit({
        timestamp: this.timestamp,
        note: this.note.trim()
      });
      this.resetForm();
    }
  }

  cancel() {
    this.resetForm();
    this.formClosed.emit();
  }

  private resetForm() {
    this.note = '';
    this.showForm = false;
  }
}
