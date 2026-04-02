// firestore-relative-time.pipe.ts (versão pura com signal)
import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'firestoreRelativeTime',
  standalone: true,
  pure: true // Mantém puro
})
export class FirestoreRelativeTimePipe implements PipeTransform {
  
  private translate = inject(TranslateService);
  
  transform(value: any, lang?: string): string {
    if (!value) return '—';

    let date: Date;

    // Detecta o objeto _Timestamp do Firestore
    if (value && typeof value === 'object' && 'seconds' in value) {
      date = new Date(value.seconds * 1000 + (value.nanoseconds || 0) / 1000000);
    } else {
      date = new Date(value);
    }

    if (isNaN(date.getTime())) return '—';

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const absDiff = Math.abs(diffInSeconds);
    const isPast = diffInSeconds >= 0;

    // Definir os parâmetros para tradução
    let translationKey = '';
    let params: any = {};

    if (absDiff < 60) {
      translationKey = isPast ? 'TIME.JUST_NOW' : 'TIME.IN_FEW_SECONDS';
    } else if (absDiff < 3600) {
      const minutes = Math.floor(absDiff / 60);
      translationKey = isPast ? 
        (minutes === 1 ? 'TIME.MINUTE_AGO' : 'TIME.MINUTES_AGO') : 
        (minutes === 1 ? 'TIME.IN_MINUTE' : 'TIME.IN_MINUTES');
      params = { count: minutes };
    } else if (absDiff < 86400) {
      const hours = Math.floor(absDiff / 3600);
      translationKey = isPast ? 
        (hours === 1 ? 'TIME.HOUR_AGO' : 'TIME.HOURS_AGO') : 
        (hours === 1 ? 'TIME.IN_HOUR' : 'TIME.IN_HOURS');
      params = { count: hours };
    } else if (absDiff < 604800) {
      const days = Math.floor(absDiff / 86400);
      translationKey = isPast ? 
        (days === 1 ? 'TIME.DAY_AGO' : 'TIME.DAYS_AGO') : 
        (days === 1 ? 'TIME.IN_DAY' : 'TIME.IN_DAYS');
      params = { count: days };
    } else if (absDiff < 2592000) {
      const weeks = Math.floor(absDiff / 604800);
      translationKey = isPast ? 
        (weeks === 1 ? 'TIME.WEEK_AGO' : 'TIME.WEEKS_AGO') : 
        (weeks === 1 ? 'TIME.IN_WEEK' : 'TIME.IN_WEEKS');
      params = { count: weeks };
    } else if (absDiff < 31536000) {
      const months = Math.floor(absDiff / 2592000);
      translationKey = isPast ? 
        (months === 1 ? 'TIME.MONTH_AGO' : 'TIME.MONTHS_AGO') : 
        (months === 1 ? 'TIME.IN_MONTH' : 'TIME.IN_MONTHS');
      params = { count: months };
    } else {
      const years = Math.floor(absDiff / 31536000);
      translationKey = isPast ? 
        (years === 1 ? 'TIME.YEAR_AGO' : 'TIME.YEARS_AGO') : 
        (years === 1 ? 'TIME.IN_YEAR' : 'TIME.IN_YEARS');
      params = { count: years };
    }

    // 🔥 Usa o idioma atual como parte do cache do pipe
    return this.translate.instant(translationKey, params);
  }
}