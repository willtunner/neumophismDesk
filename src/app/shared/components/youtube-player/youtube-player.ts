import { Component, Output, EventEmitter, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineMarkers } from './timeline-markers/timeline-markers';
import { MovieAnnotation } from '../../../models/models';
import { YouTubePlayer } from '@angular/youtube-player';

@Component({
  selector: 'app-youtube-player',
  standalone: true,
  imports: [CommonModule, TimelineMarkers, YouTubePlayer],
  templateUrl: './youtube-player.html',
  styleUrl: './youtube-player.css'
})
export class YoutubePlayerComponent implements OnInit, OnDestroy {
  @Output() timestampSelected = new EventEmitter<number>();
  
  // Inputs para receber dados externos
  @Input() videoId: string = '';
  @Input() annotations: MovieAnnotation[] = [];

  public currentTime: number = 0;
  public duration: number = 0;
  public isPlaying: boolean = false;
  private updateInterval: any;
  private playerSize: string = 'large';

  // Variáveis para o YouTube Player
  private player: any;
  public playerVars = {
    playsinline: 1,
    enablejsapi: 1,
    modestbranding: 1,
    rel: 0
  };

  ngOnInit() {
    console.log('YoutubePlayer initialized with videoId:', this.videoId);
    
    // Carrega a API do YouTube
    this.loadYouTubeApi();
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  private loadYouTubeApi() {
    // Esta parte não é mais necessária pois o componente já cuida disso
    console.log('YouTube API will be loaded by Angular YouTube Player component');
  }

  // Event handlers do YouTube Player
  onReady(event: any) {
    console.log('YouTube player ready');
    this.player = event.target;
    this.duration = this.player.getDuration();

    // Inicia o intervalo para atualizar o tempo atual
    this.updateInterval = setInterval(() => {
      if (this.player && this.player.getCurrentTime) {
        this.currentTime = this.player.getCurrentTime();
      }
    }, 200);
  }

  onStateChange(event: any) {
    const state = event.data;

    switch (state) {
      case 1: // PLAYING
        this.isPlaying = true;
        break;
      case 2: // PAUSED
      case 0: // ENDED
        this.isPlaying = false;
        break;
    }

    if (state === 1) { // PLAYING
      setTimeout(() => {
        if (this.player && this.player.getDuration) {
          this.duration = this.player.getDuration();
        }
      }, 1000);
    }
  }

  onError(event: any) {
    console.error('YouTube player error:', event.data);
  }

  // Métodos de controle do player
  seekTo(timestamp: number) {
    if (this.player) {
      this.player.seekTo(timestamp, true);
      this.currentTime = timestamp;
    }
  }

  getCurrentTime() {
    if (this.player) {
      const time = this.player.getCurrentTime();
      this.timestampSelected.emit(time);
      return time;
    }
    return 0;
  }

  onSeekTo(timestamp: number) {
    this.seekTo(timestamp);
  }

  onMarkerClick(annotation: MovieAnnotation) {
    this.seekTo(annotation.timestamp);
  }

  formatTime(seconds: number): string {
    if (!seconds || seconds === Infinity || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getPlayerState(): string {
    return this.isPlaying ? 'playing' : 'paused';
  }

  // Alternar entre play e pause
  togglePlayPause() {
    if (!this.player) return;

    const state = this.player.getPlayerState();

    if (state === 2 || state === 0) { // PAUSED or ENDED
      this.player.playVideo();
      this.isPlaying = true;
    } else if (state === 1) { // PLAYING
      this.player.pauseVideo();
      this.isPlaying = false;
    }
  }

  // Retroceder 10 segundos
  jumpBackward10() {
    if (!this.player) return;
    const newTime = Math.max(this.player.getCurrentTime() - 10, 0);
    this.seekTo(newTime);
  }

  // Retroceder um pequeno passo (2 segundos)
  stepBackward() {
    if (!this.player) return;
    const newTime = Math.max(this.player.getCurrentTime() - 2, 0);
    this.seekTo(newTime);
  }

  // Avançar um pequeno passo (2 segundos)
  stepForward() {
    if (!this.player) return;
    const newTime = Math.min(this.player.getCurrentTime() + 2, this.duration);
    this.seekTo(newTime);
  }

  // Avançar 10 segundos
  jumpForward10() {
    if (!this.player) return;
    const newTime = Math.min(this.player.getCurrentTime() + 10, this.duration);
    this.seekTo(newTime);
  }

  // Método para ajustar o tamanho do video-container
  setSize(size: string) {
    this.playerSize = size;
    const videoContainer = document.querySelector('.video-container');
    if (videoContainer) {
      switch (size) {
        case 'small':
          (videoContainer as HTMLElement).style.width = '40%';
          (videoContainer as HTMLElement).style.margin = '0 auto';
          break;
        case 'medium':
          (videoContainer as HTMLElement).style.width = '70%';
          (videoContainer as HTMLElement).style.margin = '0 auto';
          break;
        case 'large':
          (videoContainer as HTMLElement).style.width = '100%';
          (videoContainer as HTMLElement).style.margin = '0';
          break;
      }
    }
  }

  // Getter para o tamanho atual
  getCurrentSize(): string {
    return this.playerSize;
  }
}