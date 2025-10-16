// src/app/pipes/date-format.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: Date | string | null | undefined): string {
    if (!value) return '';
    
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    
    const datePipe = new DatePipe('pt-BR');
    return datePipe.transform(date, 'dd/MM/yyyy - HH:mm:ss') || '';
  }
}