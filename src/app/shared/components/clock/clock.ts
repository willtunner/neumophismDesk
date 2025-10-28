import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-clock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clock.html',
  styleUrls: ['./clock.css']
})
export class Clock implements OnInit, OnDestroy {
  private timeSubscription!: Subscription;
  
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  currentTime: string = '';
  isAnalog: boolean = true;

  ngOnInit(): void {
    this.updateTime();
    this.timeSubscription = interval(1000).subscribe(() => {
      this.updateTime();
    });
  }

  ngOnDestroy(): void {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
  }

  private updateTime(): void {
    const now = new Date();
    this.hours = now.getHours();
    this.minutes = now.getMinutes();
    this.seconds = now.getSeconds();
    
    // Formato digital
    this.currentTime = now.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  }

  toggleMode(): void {
    this.isAnalog = !this.isAnalog;
  }

  getHourRotation(): number {
    return (this.hours % 12) * 30 + this.minutes * 0.5;
  }

  getMinuteRotation(): number {
    return this.minutes * 6 + this.seconds * 0.1;
  }

  getSecondRotation(): number {
    return this.seconds * 6;
  }

  getCurrentDate(): string {
  const now = new Date();
  return now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}
}