import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Annotation } from '../../../../models/annotation.model';

@Component({
  selector: 'app-timeline-markers',
  imports: [CommonModule],
  templateUrl: './timeline-markers.html',
  styleUrl: './timeline-markers.css'
})
export class TimelineMarkers implements AfterViewInit, OnChanges  {
@ViewChild('timelineContainer') timelineContainer!: ElementRef;
  @Input() annotations: Annotation[] = [];
  @Input() currentTime: number = 0;
  @Input() duration: number = 0;
  @Output() seekTo = new EventEmitter<number>();
  @Output() markerClick = new EventEmitter<Annotation>();

  progressPercentage: number = 0;

  ngAfterViewInit() {
    this.updateProgress();
  }

  ngOnChanges() {
    this.updateProgress();
  }

  private updateProgress() {
    if (this.duration > 0) {
      this.progressPercentage = (this.currentTime / this.duration) * 100;
    }
  }

  getMarkerPosition(timestamp: number): number {
    if (this.duration > 0) {
      return (timestamp / this.duration) * 100;
    }
    return 0;
  }

  onTimelineClick(event: MouseEvent) {
    const timeline = this.timelineContainer.nativeElement.querySelector('.timeline-bar');
    const rect = timeline.getBoundingClientRect();
    const clickPosition = (event.clientX - rect.left) / rect.width;
    const seekTime = clickPosition * this.duration;
    
    this.seekTo.emit(seekTime);
  }

  onMarkerClick(annotation: Annotation, event: Event) {
    event.stopPropagation();
    this.markerClick.emit(annotation);
  }
}
