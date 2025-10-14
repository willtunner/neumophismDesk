import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieAnnotation } from '../../../../models/models';

@Component({
  selector: 'app-timeline-markers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline-markers.html',
  styleUrls: ['./timeline-markers.css']
})
export class TimelineMarkers implements OnChanges {
  @Input() annotations: MovieAnnotation[] = [];
  @Input() currentTime: number = 0;
  @Input() duration: number = 0;
  @Input() isPlaying: boolean = false;

  @Output() seekTo = new EventEmitter<number>();
  @Output() markerClick = new EventEmitter<MovieAnnotation>();

  // novos eventos para controle
  @Output() togglePlayPause = new EventEmitter<void>();
  @Output() rewind10 = new EventEmitter<void>();
  @Output() rewind = new EventEmitter<void>();
  @Output() forward = new EventEmitter<void>();
  @Output() forward10 = new EventEmitter<void>();

  progressPercentage: number = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentTime'] || changes['duration']) {
      this.updateProgress();
    }
  }

  private updateProgress() {
    if (this.duration > 0) {
      this.progressPercentage = (this.currentTime / this.duration) * 100;
      if (!isFinite(this.progressPercentage)) this.progressPercentage = 0;
    } else {
      this.progressPercentage = 0;
    }
  }

  getMarkerPosition(timestamp: number): number {
    if (this.duration > 0) {
      return (timestamp / this.duration) * 100;
    }
    return 0;
  }

  getMarkerTooltip(annotation: MovieAnnotation): string {
    return `${this.formatTime(annotation.timestamp)} - ${annotation.note ?? ''}`;
  }

  getCurrentTimeTooltip(): string {
    const status = this.isPlaying ? 'Reproduzindo' : 'Pausado';
    return `${status}: ${this.formatTime(this.currentTime)}`;
  }

  onTimelineClick(event: MouseEvent) {
    const timeline = event.currentTarget as HTMLElement;
    const rect = timeline.getBoundingClientRect();
    const clickPosition = (event.clientX - rect.left) / rect.width;
    const seekTime = clickPosition * this.duration;
    this.seekTo.emit(seekTime);
  }

  onMarkerClick(annotation: MovieAnnotation, event: Event) {
    event.stopPropagation();
    this.markerClick.emit(annotation);
  }

  // formatação de tempo
  formatTime(seconds: number): string {
    if (!seconds || seconds === Infinity || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // botões controladores -> apenas emitem eventos para componente pai
  onTogglePlayPause() { this.togglePlayPause.emit(); }
  onRewind10() { this.rewind10.emit(); }
  onRewind() { this.rewind.emit(); }
  onForward() { this.forward.emit(); }
  onForward10() { this.forward10.emit(); }
}
