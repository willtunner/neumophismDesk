import { Pipe, PipeTransform } from '@angular/core';

interface FirestoreTimestamp {
  type: string;
  seconds: number;
  nanoseconds: number;
}

@Pipe({
  name: 'firestoreDateOnly',
  standalone: true
})
export class FirestoreDateOnlyPipe implements PipeTransform {

  transform(value: FirestoreTimestamp | Date | string | null | undefined): string {
    if (!value) {
      return '—';
    }

    let date: Date;

    // Se for um objeto FirestoreTimestamp
    if (this.isFirestoreTimestamp(value)) {
      date = new Date(value.seconds * 1000 + value.nanoseconds / 1000000);
    }
    // Se for uma string de data
    else if (typeof value === 'string') {
      date = new Date(value);
    }
    // Se já for um Date
    else if (value instanceof Date) {
      date = value;
    }
    // Se for null ou undefined
    else {
      return '—';
    }

    // Verifica se a data é válida
    if (isNaN(date.getTime())) {
      return '—';
    }

    return this.formatDate(date);
  }

  private isFirestoreTimestamp(value: any): value is FirestoreTimestamp {
    return value && 
           typeof value === 'object' && 
           value.type === 'firestore/timestamp/1.0' &&
           typeof value.seconds === 'number' &&
           typeof value.nanoseconds === 'number';
  }

  private formatDate(date: Date): string {
    const day = this.padZero(date.getDate());
    const month = this.padZero(date.getMonth() + 1);
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  private padZero(num: number): string {
    return num.toString().padStart(2, '0');
  }
}

/**
 * 
 * 
 * 
Para data apenas (dd/mm/yyyy):

html
{{ loggedUser.created | firestoreTimestamp:'date' }}
<!-- Resultado: 05/01/2025 -->
Para data e hora (dd/mm/yyyy - hh:mm:ss):

html
{{ loggedUser.created | firestoreTimestamp:'datetime' }}
<!-- Resultado: 05/01/2025 - 14:08:38 -->
Se não passar parâmetro, usa 'date' como padrão:

html
{{ loggedUser.created | firestoreTimestamp }}
<!-- Resultado: 05/01/2025 -->

 */