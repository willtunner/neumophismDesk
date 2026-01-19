import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { EventModalComponent } from './event-modal/event-modal';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Weather } from '../weather/weather';
import { Clock } from '../../shared/components/clock/clock';
import { NewsComponent } from '../../shared/components/news/news';
import { Subscription } from 'rxjs';

export interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
}

interface Holiday {
  date: string;
  name: string;
  type: string;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, Weather, Clock, NewsComponent],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.scss']
})
export class Calendar implements OnInit, OnDestroy {
  // Signals
  currentYear = signal(new Date().getFullYear());
  events = signal<CalendarEvent[]>(this.loadEventsFromStorage());
  holidays = signal<Holiday[]>([]);
  loading = signal(false);
  
  // Signal para forçar atualização dos meses quando o idioma mudar
  private languageChanged = signal(0);
  
  // Dias da semana - agora é um signal que será atualizado com as traduções
  weekDaysMini = signal<string[]>(['D', 'S', 'T', 'Q', 'Q', 'S', 'S']);

  // NOVO: Dias da semana completos para tooltip
  weekDaysFull = signal<string[]>([]);
  
  // Computed values - agora depende do languageChanged para atualizar
  monthsGrid = computed(() => {
    // Inclui languageChanged() na dependência para forçar recálculo
    const languageTrigger = this.languageChanged();
    const year = this.currentYear();
    const today = new Date();
    
    return Array.from({ length: 12 }, (_, monthIndex) => {
      const monthName = this.getMonthName(monthIndex);
      const days = this.generateMonthDays(year, monthIndex, today);
      
      return { name: monthName, days };
    });
  });

  sortedEvents = computed(() => {
    return [...this.events()].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  });

  private dialog = inject(MatDialog);
  private http = inject(HttpClient);
  private translate = inject(TranslateService);
  private translateSubscription!: Subscription;
  private apiKey = '21075|Wiu4ByEDG4xvXHH8Lfnbm2GILonpwEiu';

  ngOnInit() {
    this.loadEventsFromStorage();
    this.fetchHolidays();
    
    // Carrega as traduções iniciais
    this.updateTranslations();
    
    // Escuta mudanças de idioma
    this.translateSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateTranslations();
    });
  }

  ngOnDestroy() {
    if (this.translateSubscription) {
      this.translateSubscription.unsubscribe();
    }
  }

  // Atualiza todas as traduções quando o idioma muda
  private updateTranslations(): void {
    // Atualiza os dias da semana
    const translatedWeekdays = [
      this.translate.instant('CALENDAR.WEEKDAYS.SUNDAY'),
      this.translate.instant('CALENDAR.WEEKDAYS.MONDAY'),
      this.translate.instant('CALENDAR.WEEKDAYS.TUESDAY'),
      this.translate.instant('CALENDAR.WEEKDAYS.WEDNESDAY'),
      this.translate.instant('CALENDAR.WEEKDAYS.THURSDAY'),
      this.translate.instant('CALENDAR.WEEKDAYS.FRIDAY'),
      this.translate.instant('CALENDAR.WEEKDAYS.SATURDAY')
    ];
    this.weekDaysMini.set(translatedWeekdays);

        // NOVO: Atualiza os dias da semana completos
    const translatedWeekdaysFull = [
      this.translate.instant('CALENDAR.WEEKDAYS_FULL.SUNDAY'),
      this.translate.instant('CALENDAR.WEEKDAYS_FULL.MONDAY'),
      this.translate.instant('CALENDAR.WEEKDAYS_FULL.TUESDAY'),
      this.translate.instant('CALENDAR.WEEKDAYS_FULL.WEDNESDAY'),
      this.translate.instant('CALENDAR.WEEKDAYS_FULL.THURSDAY'),
      this.translate.instant('CALENDAR.WEEKDAYS_FULL.FRIDAY'),
      this.translate.instant('CALENDAR.WEEKDAYS_FULL.SATURDAY')
    ];
    this.weekDaysFull.set(translatedWeekdaysFull);
    
    // Força a atualização dos meses incrementando o signal
    this.languageChanged.update(val => val + 1);
  }

  // Método para obter nome do mês traduzido
  private getMonthName(monthIndex: number): string {
    const monthKeys = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    return this.translate.instant(`CALENDAR.MONTHS.${monthKeys[monthIndex]}`);
  }

  // Resto do código permanece igual...
  private generateMonthDays(year: number, month: number, today: Date) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Dias do mês anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push(this.createDayObject(date, prevMonthLastDay - i, false, today));
    }
    
    // Dias do mês atual
    const daysInMonth = lastDay.getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push(this.createDayObject(date, i, true, today));
    }
    
    // Dias do próximo mês
    const totalCells = 42; // 6 semanas
    const nextMonthDays = totalCells - days.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push(this.createDayObject(date, i, false, today));
    }
    
    return days;
  }

    // NOVO: Método para obter tooltip do dia da semana
  getWeekdayTooltip(dayIndex: number): string {
    const weekDays = this.weekDaysFull();
    if (weekDays[dayIndex]) {
      return weekDays[dayIndex];
    }
    return '';
  }

  private createDayObject(date: Date, number: number, isCurrentMonth: boolean, today: Date) {
    return {
      date,
      number,
      isCurrentMonth,
      isToday: this.isSameDay(date, today),
      hasEvents: this.hasEventsOnDate(date),
      isHoliday: this.isHoliday(date)
    };
  }

  // API de Feriados
  private fetchHolidays(): void {
    this.loading.set(true);
    const year = this.currentYear();
    const apiUrl = `https://api.invertexto.com/v1/holidays/${year}?token=${this.apiKey}`;

    this.http.get<Holiday[]>(apiUrl).subscribe({
      next: (data) => {
        this.holidays.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar feriados:', err);
        this.loading.set(false);
      }
    });
  }

  // Verifica se é feriado
  private isHoliday(date: Date): boolean {
    const dateStr = date.toISOString().split('T')[0];
    return this.holidays().some(h => h.date === dateStr);
  }

  // Obtém o nome do feriado para tooltip
  getHolidayName(date: Date): string | null {
    const dateStr = date.toISOString().split('T')[0];
    return this.holidays().find(h => h.date === dateStr)?.name || null;
  }

  // Tooltip para os dias
  getDayTooltip(date: Date): string {
    if (!date || !this.isSameDay(date, date)) return '';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    // Se for hoje
    if (this.isToday(date)) {
      return `Hoje!\n${day}/${month}/${year}`;
    }
    
    // Se for feriado
    const holidayName = this.getHolidayName(date);
    if (holidayName) {
      return `${day}/${month}/${year}\n${holidayName}`;
    }
    
    // Se tem eventos
    const events = this.getEventsForDate(date);
    if (events.length > 0) {
      const eventText = events.length === 1 ? '1 Evento' : `${events.length} Eventos`;
      return `${day}/${month}/${year}\n${eventText}`;
    }
    
    // Data normal
    return `${day}/${month}/${year}`;
  }

  // Verifica se é hoje
  private isToday(date: Date): boolean {
    const today = new Date();
    return this.isSameDay(date, today);
  }

  // Navegação com recarregamento de feriados
  previousYear(): void {
    this.currentYear.update(year => year - 1);
    this.fetchHolidays();
  }

  nextYear(): void {
    this.currentYear.update(year => year + 1);
    this.fetchHolidays();
  }

  // Métodos de eventos (mantidos do original)
  openEventModal(date: Date): void {
    const dialogRef = this.dialog.open(EventModalComponent, {
      width: '500px',
      maxWidth: '90vw',
      panelClass: 'neu-modal-container',
      data: {
        date: date,
        event: null,
        isEdit: false
      }
    });

    dialogRef.afterClosed().subscribe((result: CalendarEvent | null) => {
      if (result) {
        this.saveEvent(result);
      }
    });
  }

  editEvent(event: CalendarEvent): void {
    const dialogRef = this.dialog.open(EventModalComponent, {
      width: '500px',
      maxWidth: '90vw',
      panelClass: 'neu-modal-container',
      data: {
        date: event.date,
        event: event,
        isEdit: true
      }
    });

    dialogRef.afterClosed().subscribe((result: CalendarEvent | null) => {
      if (result) {
        this.updateEvent(result);
      }
    });
  }

  private saveEvent(event: CalendarEvent): void {
    this.events.update(events => [...events, { ...event, id: this.generateId() }]);
    this.saveEventsToStorage();
  }

  private updateEvent(event: CalendarEvent): void {
    this.events.update(events => 
      events.map(e => e.id === event.id ? event : e)
    );
    this.saveEventsToStorage();
  }

  deleteEvent(eventId: string): void {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      this.events.update(events => events.filter(e => e.id !== eventId));
      this.saveEventsToStorage();
    }
  }

  // Helper methods
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  private hasEventsOnDate(date: Date): boolean {
    return this.events().some(event => this.isSameDay(event.date, date));
  }

  private getEventsForDate(date: Date): CalendarEvent[] {
    return this.events().filter(e => this.isSameDay(e.date, date));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private loadEventsFromStorage(): CalendarEvent[] {
    try {
      const stored = localStorage.getItem('calendar-events');
      if (stored) {
        const events = JSON.parse(stored);
        return events.map((event: any) => ({
          ...event,
          date: new Date(event.date)
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
    return [];
  }

  private saveEventsToStorage(): void {
    localStorage.setItem('calendar-events', JSON.stringify(this.events()));
  }
}