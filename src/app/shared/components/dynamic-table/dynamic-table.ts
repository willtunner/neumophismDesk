import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateOnlyFormatPipe } from '../../../pipes/date-only-format.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { FirestoreDateOnlyPipe } from '../../../pipes/firestore-timestamp-pipe';

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [
    CommonModule, 
    DateOnlyFormatPipe, 
    FirestoreDateOnlyPipe, // Adicione aqui
    MatTooltipModule, 
    TranslateModule
  ],
  templateUrl: './dynamic-table.html',
  styleUrl: './dynamic-table.css',
})
export class DynamicTableComponent {
  @Input() headers: { label: string; field: string }[] = [];
  @Input() data: any[] = [];
  @Input() selectedRow: any = null;

  @Output() edit = new EventEmitter<any>();
  @Output() remove = new EventEmitter<any>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() selectedRowChange = new EventEmitter<any>();

  onEdit(row: any) {
    this.edit.emit(row);
  }

  onRemove(row: any) {
    this.remove.emit(row);
  }

  onRowClick(row: any) {
    if (this.selectedRow === row) {
      this.selectedRow = null;
    } else {
      this.selectedRow = row;
    }
    
    this.rowClick.emit(row);
    this.selectedRowChange.emit(this.selectedRow);
  }

  isRowSelected(row: any): boolean {
    if (!this.selectedRow || !row) return false;
    return this.selectedRow.id === row.id;
  }

  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) ?? '—';
  }

  // 🆕 Método para detectar se é FirestoreTimestamp
  isFirestoreTimestamp(value: any): boolean {
    return value && 
           typeof value === 'object' && 
           value.type === 'firestore/timestamp/1.0' &&
           typeof value.seconds === 'number' &&
           typeof value.nanoseconds === 'number';
  }

  // 🆕 Método para detectar se é Date normal
  isDate(value: any): boolean {
    if (!value) return false;
    
    // Se for FirestoreTimestamp, não é Date puro
    if (this.isFirestoreTimestamp(value)) return false;
    
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
}