import { Pipe, PipeTransform, Inject, LOCALE_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'translatedMonth',
  standalone: true
})
export class TranslatedMonthPipe implements PipeTransform {
  
  private monthTranslations: { [key: string]: { [key: string]: string } } = {
    'pt': {
      'Jan': 'JAN', 'Feb': 'FEV', 'Mar': 'MAR', 'Apr': 'ABR',
      'May': 'MAI', 'Jun': 'JUN', 'Jul': 'JUL', 'Aug': 'AGO',
      'Sep': 'SET', 'Oct': 'OUT', 'Nov': 'NOV', 'Dec': 'DEZ'
    },
    'es': {
      'Jan': 'ENE', 'Feb': 'FEB', 'Mar': 'MAR', 'Apr': 'ABR',
      'May': 'MAY', 'Jun': 'JUN', 'Jul': 'JUL', 'Aug': 'AGO',
      'Sep': 'SEP', 'Oct': 'OCT', 'Nov': 'NOV', 'Dec': 'DIC'
    },
    'en': {
      'Jan': 'JAN', 'Feb': 'FEB', 'Mar': 'MAR', 'Apr': 'APR',
      'May': 'MAY', 'Jun': 'JUN', 'Jul': 'JUL', 'Aug': 'AUG',
      'Sep': 'SEP', 'Oct': 'OCT', 'Nov': 'NOV', 'Dec': 'DEC'
    }
  };

  constructor(
    private translate: TranslateService,
    @Inject(LOCALE_ID) private locale: string
  ) {}

  transform(value: string | Date, format: string = 'short'): string {
    if (!value) return '';
    
    let monthKey: string;
    
    if (value instanceof Date) {
      // Se for uma Date, usa o formato padrão do Angular
      monthKey = value.toLocaleDateString('en-US', { month: 'short' });
    } else {
      // Se for string, assume que já é a abreviação em inglês
      monthKey = value;
    }
    
    const currentLang = this.translate.currentLang || this.translate.defaultLang || 'pt';
    
    // Retorna a tradução ou mantém o original se não encontrar
    return this.monthTranslations[currentLang]?.[monthKey] || monthKey.toUpperCase();
  }
}