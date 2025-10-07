import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EventModalComponent } from './event-modal/event-modal';
import { TranslateModule } from '@ngx-translate/core';
import { TranslatedMonthPipe } from '../../pipes/portuguese-month-pipe';

export interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
}

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FormsModule, TranslateModule, TranslatedMonthPipe ],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss'
})


export class Calendar {
  // Signals
  currentYear = signal(new Date().getFullYear());
  events = signal<CalendarEvent[]>(this.loadEventsFromStorage());
  
  // Computed values
  monthsGrid = computed(() => {
    const year = this.currentYear();
    const today = new Date();
    
    return Array.from({ length: 12 }, (_, monthIndex) => {
      const monthDate = new Date(year, monthIndex, 1);
      const monthName = monthDate.toLocaleString('pt-BR', { month: 'long' });
      const days = this.generateMonthDays(year, monthIndex, today);
      
      return { name: monthName, days };
    });
  });

  sortedEvents = computed(() => {
    return [...this.events()].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  });

  weekDaysMini = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  private dialog = inject(MatDialog);

  ngOnInit() {
    this.loadEventsFromStorage();
  }

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

  private createDayObject(date: Date, number: number, isCurrentMonth: boolean, today: Date) {
    return {
      date,
      number,
      isCurrentMonth,
      isToday: this.isSameDay(date, today),
      hasEvents: this.hasEventsOnDate(date)
    };
  }

  // Navegação
  previousYear(): void {
    this.currentYear.update(year => year - 1);
  }

  nextYear(): void {
    this.currentYear.update(year => year + 1);
  }

  // Métodos de eventos
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
    this.events.update(events => [...events, event]);
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