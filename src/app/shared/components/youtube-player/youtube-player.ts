// components/youtube-player/youtube-player.component.ts
import { Component, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineMarkers } from './timeline-markers/timeline-markers';
import { Annotation } from '../../../models/annotation.model';

@Component({
  selector: 'app-youtube-player',
  imports: [CommonModule, TimelineMarkers],
  templateUrl: './youtube-player.html',
  styleUrl: './youtube-player.css'
})
export class YoutubePlayer {
  @ViewChild('youTubePlayer') youTubePlayer!: ElementRef;
  @Output() timestampSelected = new EventEmitter<number>();
  @Input() videoId: string = '';
  @Input() annotations: Annotation[] = [];
  
  private player: any;
  public currentTime: number = 0;
  public duration: number = 0;
  public isPlaying: boolean = false;
  private updateInterval: any;

  ngAfterViewInit() {
    this.loadYouTubeAPI();
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  private loadYouTubeAPI() {
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      
      (window as any).onYouTubeIframeAPIReady = () => {
        this.createPlayer();
      };
    } else {
      this.createPlayer();
    }
  }

  private createPlayer() {
    this.player = new (window as any).YT.Player(this.youTubePlayer.nativeElement, {
      height: '400',
      width: '100%',
      videoId: this.videoId,
      playerVars: {
        playsinline: 1,
        enablejsapi: 1
      },
      events: {
        'onReady': this.onPlayerReady.bind(this),
        'onStateChange': this.onPlayerStateChange.bind(this)
      }
    });
  }

  private onPlayerReady(event: any) {
    this.duration = this.player.getDuration();
    
    // Atualizar tempo atual frequentemente para smooth progress
    this.updateInterval = setInterval(() => {
      if (this.player && this.player.getCurrentTime) {
        this.currentTime = this.player.getCurrentTime();
      }
    }, 100); // Atualiza a cada 100ms para ser mais suave

    // Atualizar duração se mudar (para vídeos ao vivo)
    setInterval(() => {
      if (this.player && this.player.getDuration) {
        const newDuration = this.player.getDuration();
        if (newDuration !== this.duration) {
          this.duration = newDuration;
        }
      }
    }, 5000);
  }

  private onPlayerStateChange(event: any) {
    switch (event.data) {
      case (window as any).YT.PlayerState.PLAYING:
        this.isPlaying = true;
        break;
      case (window as any).YT.PlayerState.PAUSED:
        this.isPlaying = false;
        break;
      case (window as any).YT.PlayerState.ENDED:
        this.isPlaying = false;
        break;
      case (window as any).YT.PlayerState.BUFFERING:
        // Mantém o estado atual durante buffering
        break;
    }

    // Atualizar duração quando o vídeo começar
    if (event.data === (window as any).YT.PlayerState.PLAYING) {
      setTimeout(() => {
        if (this.player && this.player.getDuration) {
          this.duration = this.player.getDuration();
        }
      }, 1000);
    }
  }

  getCurrentTime() {
    if (this.player) {
      const time = this.player.getCurrentTime();
      this.timestampSelected.emit(time);
      
      // Feedback visual
      const btn = document.querySelector('.btn') as HTMLElement;
      if (btn) {
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
          btn.style.transform = '';
        }, 150);
      }
    }
  }

  seekTo(timestamp: number) {
    if (this.player) {
      this.player.seekTo(timestamp, true);
      this.currentTime = timestamp; // Atualiza imediatamente
    }
  }

  onSeekTo(timestamp: number) {
    this.seekTo(timestamp);
  }

  onMarkerClick(annotation: Annotation) {
    this.seekTo(annotation.timestamp);
  }

  formatTime(seconds: number): string {
    if (!seconds || seconds === Infinity || isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Método para obter o estado atual do player
  getPlayerState(): string {
    return this.isPlaying ? 'playing' : 'paused';
  }
}
