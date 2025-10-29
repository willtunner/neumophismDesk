import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clock.html',
  styleUrls: ['./clock.scss']
})
export class Clock implements OnInit, OnDestroy {
  currentTime = signal<string>('--:--');
  currentDate = signal<string>('');
  isAnalog = signal<boolean>(true);
  timeFormat = signal<string>('AM');
  
  private intervalId: any;

  ngOnInit() {
    this.updateClock();
    this.intervalId = setInterval(() => {
      this.updateClock();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  toggleClockType() {
    this.isAnalog.set(!this.isAnalog());
  }

  private updateClock() {
    const now = new Date();
    
    // Atualizar relógio digital
    const hours = this.handleZero(this.handleTimeFormat(now.getHours()));
    const minutes = this.handleZero(now.getMinutes());
    const seconds = this.handleZero(now.getSeconds());
    
    this.currentTime.set(`${hours}:${minutes}:${seconds}`);
    this.currentDate.set(this.formatDate(now));

    // Atualizar ponteiros do relógio analógico
    this.updateAnalogClock(now);
  }

  private handleZero(number: number): string {
    return number < 10 ? `0${number}` : `${number}`;
  }

  private handleTimeFormat(hours: number): number {
    if (hours > 12) {
      this.timeFormat.set('PM');
      return hours - 12;
    } else {
      this.timeFormat.set('AM');
      return hours === 0 ? 12 : hours;
    }
  }

  private formatDate(date: Date): string {
    const day = date.getDate();
    const month = date.toLocaleDateString('pt-BR', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  }

  private updateAnalogClock(date: Date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // Calcular rotações
    const hoursRotation = (hours % 12) * 30 + minutes * 0.5;
    const minutesRotation = minutes * 6;
    const secondsRotation = seconds * 6;

    // Aplicar rotações aos ponteiros
    this.setNeedleRotation('.hours-needle', hoursRotation);
    this.setNeedleRotation('.minutes-needle', minutesRotation);
    this.setNeedleRotation('.seconds-needle', secondsRotation);
  }

  private setNeedleRotation(selector: string, rotation: number) {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.style.transform = `translate(-50%, -100%) rotate(${rotation}deg)`;
    }
  }
}