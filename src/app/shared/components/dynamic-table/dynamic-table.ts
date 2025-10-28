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
  @Input() selectedRow: any = null;

  @Output() edit = new EventEmitter<any>();
  @Output() remove = new EventEmitter<any>();
  @Output() rowClick = new EventEmitter<any>(); // 🆕 Emitir clique da linha
    // 🆕 Emitir quando a seleção mudar
  @Output() selectedRowChange = new EventEmitter<any>();

  onEdit(row: any) {
    this.edit.emit(row);
  }

  onRemove(row: any) {
    this.remove.emit(row);
  }

  onRowClick(row: any) {
    // 🆕 Alternar seleção: se clicar na mesma linha, desseleciona
    if (this.selectedRow === row) {
      this.selectedRow = null;
    } else {
      this.selectedRow = row;
    }
    
    this.rowClick.emit(row);
    this.selectedRowChange.emit(this.selectedRow);
  }

    // 🆕 Método para verificar se a linha está selecionada
  isRowSelected(row: any): boolean {
    return this.selectedRow === row;
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
