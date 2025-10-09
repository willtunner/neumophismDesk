import { Component, ViewChild } from '@angular/core';
import { YoutubePlayer } from '../../shared/components/youtube-player/youtube-player';
import { AnnotationForm } from '../../shared/components/youtube-player/annotation-form/annotation-form';
import { AnnotationList } from '../../shared/components/youtube-player/annotation-list/annotation-list';
import { Annotation } from '../../models/annotation.model';
import { AnnotationService } from '../../services/annotation';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VideoDropdownComponent } from '../../shared/components/video-dropdown/video-dropdown';

@Component({
  selector: 'app-tutorials',
  imports: [    
   YoutubePlayer,
    AnnotationForm,
    AnnotationList,
    CommonModule,
    FormsModule, 
    ReactiveFormsModule, 
    VideoDropdownComponent
  ],
  templateUrl: './tutorials.html',
  styleUrl: './tutorials.css'
})
export class Tutorials {
 @ViewChild('youtubePlayer') youtubePlayer!: YoutubePlayer;
  
  youtubeUrl: string = '';
  currentVideoId: string = '';
  selectedTimestamp: number = 0;
  currentAnnotations: Annotation[] = [];

  constructor(private annotationService: AnnotationService) {
    this.annotationService.annotations$.subscribe(annotations => {
      this.currentAnnotations = annotations.filter(ann => ann.videoId === this.currentVideoId);
    });
  }

  loadVideo() {
    const videoId = this.extractVideoId(this.youtubeUrl);
    if (videoId) {
      this.currentVideoId = videoId;
      this.selectedTimestamp = 0;
      this.currentAnnotations = this.annotationService.getAnnotationsByVideo(videoId);
    } else {
      alert('URL do YouTube inválida!');
    }
  }

  onTimestampSelected(timestamp: number) {
    this.selectedTimestamp = timestamp;
  }

  onAnnotationSaved(data: { timestamp: number; note: string }) {
    this.annotationService.addAnnotation({
      videoId: this.currentVideoId,
      timestamp: data.timestamp,
      note: data.note
    });
    this.selectedTimestamp = 0;
  }

  onFormClosed() {
    this.selectedTimestamp = 0;
  }

  onSeekTo(timestamp: number) {
    if (this.youtubePlayer) {
      this.youtubePlayer.seekTo(timestamp);
    }
  }

  onDeleteAnnotation(id: string) {
    this.annotationService.deleteAnnotation(id);
  }

  private extractVideoId(url: string): string {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : '';
  }
}
