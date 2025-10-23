// date-only-format.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateOnlyFormat',
  standalone: true
})
export class DateOnlyFormatPipe implements PipeTransform {
  transform(value: Date | string | null | undefined): string {
    if (!value) return '-';
    
    const date = new Date(value);
    
    if (isNaN(date.getTime())) return '-';
    
    // Formato: "01/07/2025"
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }
}