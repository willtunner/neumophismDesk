import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Call } from '../../../models/models';
import { DateOnlyFormatPipe } from '../../../pipes/date-only-format.pipe';
import { DynamicTableComponent } from '../../../shared/components/dynamic-table/dynamic-table';

@Component({
  selector: 'app-call-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, DateOnlyFormatPipe, DynamicTableComponent],
  templateUrl: './call-list.html',
  styleUrl: './call-list.css'
})
export class CallList implements OnInit {
  @Input() calls: Call[] = [];
  @Output() viewDetails = new EventEmitter<Call>();

  tableHeaders = [
    { label: 'TABLE.ID', field: 'id' },
    { label: 'TABLE.TITLE', field: 'title' },
    { label: 'TABLE.CONECTION', field: 'connection' },
    { label: 'TABLE.OBSERVATION', field: 'description' },
    { label: 'TABLE.RESOLUTION', field: 'resolution' },
    { label: 'TABLE.CREATED_AT', field: 'created' },
    { label: 'TABLE.CLIENT', field: 'client.name' },
    { label: 'TABLE.OPERATOR', field: 'operator.name' },
    { label: 'TABLE.HELPDESK', field: 'helpDeskCompany.name' },
  ];

  ngOnInit(): void {}

  onRowClick(call: Call) {
    this.viewDetails.emit(call);
  }

  onEdit(call: Call) {
    console.log('Editar:', call);
  }

  onDelete(call: Call) {
    console.log('Excluir:', call);
  }
}
