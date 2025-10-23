import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateOnlyFormatPipe } from '../../../pipes/date-only-format.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [CommonModule, DateOnlyFormatPipe, MatTooltipModule, TranslateModule],
  templateUrl: './dynamic-table.html',
  styleUrl: './dynamic-table.css',
})
export class DynamicTableComponent {
  @Input() headers: { label: string; field: string }[] = [];
  @Input() data: any[] = [];

  @Output() edit = new EventEmitter<any>();
  @Output() remove = new EventEmitter<any>();
  @Output() rowClick = new EventEmitter<any>(); // 🆕 Emitir clique da linha

  onEdit(row: any) {
    this.edit.emit(row);
  }

  onRemove(row: any) {
    this.remove.emit(row);
  }

  onRowClick(row: any) {
    this.rowClick.emit(row);
  }

  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) ?? '—';
  }

  isDate(value: any): boolean {
    if (!value) return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
}
