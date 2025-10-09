import { Component, Input, Output, EventEmitter,OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Annotation } from '../../../../models/annotation.model';

@Component({
  selector: 'app-timeline-markers',
  imports: [CommonModule],
  templateUrl: './timeline-markers.html',
  styleUrl: './timeline-markers.css'
})
export class TimelineMarkers implements OnChanges {
  @Input() annotations: Annotation[] = [];
  @Input() currentTime: number = 0;
  @Input() duration: number = 0;
  @Input() isPlaying: boolean = false;
  @Output() seekTo = new EventEmitter<number>();
  @Output() markerClick = new EventEmitter<Annotation>();

  progressPercentage: number = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentTime'] || changes['duration']) {
      this.updateProgress();
    }
  }

  private updateProgress() {
    if (this.duration > 0) {
      this.progressPercentage = (this.currentTime / this.duration) * 100;
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

  getMarkerTooltip(annotation: Annotation): string {
    return `${this.formatTime(annotation.timestamp)} - ${annotation.note}`;
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

  onMarkerClick(annotation: Annotation, event: Event) {
    event.stopPropagation();
    this.markerClick.emit(annotation);
  }

  formatTime(seconds: number): string {
    if (!seconds || seconds === Infinity || isNaN(seconds)) return '0:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
