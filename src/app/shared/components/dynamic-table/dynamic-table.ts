import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateOnlyFormatPipe } from '../../../pipes/date-only-format.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService  } from '@ngx-translate/core';
import { FirestoreRelativeTimePipe } from '../../../pipes/firestore-relative-time.pipe';

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [
    CommonModule, 
    DateOnlyFormatPipe,
    FirestoreRelativeTimePipe,
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

    // 🔥 Adiciona o TranslateService para usar no template
  translate = inject(TranslateService);

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

  // 🔥 CORREÇÃO: Método para detectar o _Timestamp do Firestore (formato que você está recebendo)
  isFirestoreTimestamp(value: any): boolean {
    if (!value) return false;
    
    // Verifica se é o objeto _Timestamp do Firestore (sem o campo 'type')
    // Formato que você mostrou: { seconds: 1761744567, nanoseconds: 507000000 }
    return value && 
           typeof value === 'object' && 
           'seconds' in value && 
           typeof value.seconds === 'number' &&
           'nanoseconds' in value &&
           typeof value.nanoseconds === 'number';
  }

  // Método para detectar se é Date normal
  isDate(value: any): boolean {
    if (!value) return false;
    
    // Se for FirestoreTimestamp, não é Date puro
    if (this.isFirestoreTimestamp(value)) return false;
    
    // Se já for uma instância de Date
    if (value instanceof Date) return true;
    
    // Tenta converter para Date
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
}