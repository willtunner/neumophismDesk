import { Component, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineMarkers } from './timeline-markers/timeline-markers';
import { MovieAnnotation } from '../../../models/models';

@Component({
  selector: 'app-youtube-player',
  standalone: true,
  imports: [CommonModule, TimelineMarkers],
  templateUrl: './youtube-player.html',
  styleUrl: './youtube-player.css'
})
export class YoutubePlayer implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('youTubePlayer') youTubePlayer!: ElementRef;
  @Output() timestampSelected = new EventEmitter<number>();
  
  // Inputs para receber dados externos
  @Input() videoId: string = '';
  @Input() annotations: MovieAnnotation[] = [];

  private player: any;
  public currentTime: number = 0;
  public duration: number = 0;
  public isPlaying: boolean = false;
  private updateInterval: any;
  private playerSize: string = 'large';

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    console.log('YoutubePlayer initialized with videoId:', this.videoId);
  }

  ngAfterViewInit() {
    if (this.videoId) {
      this.loadYouTubeAPI();
    } else {
      console.warn('No videoId provided to YoutubePlayer');
    }
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
    if (!this.videoId) {
      console.error('No videoId available to create player');
      return;
    }

    this.player = new (window as any).YT.Player(this.youTubePlayer.nativeElement, {
      height: '400',
      width: '100%',
      videoId: this.videoId,
      playerVars: {
        playsinline: 1,
        enablejsapi: 1,
        modestbranding: 1,
        rel: 0
      },
      events: {
        'onReady': this.onPlayerReady.bind(this),
        'onStateChange': this.onPlayerStateChange.bind(this),
        'onError': this.onPlayerError.bind(this)
      }
    });
  }

  private onPlayerReady(event: any) {
    console.log('YouTube player ready');
    this.duration = this.player.getDuration();

    // 🔥 Rodar o intervalo dentro do NgZone para o Angular detectar as mudanças
    this.ngZone.runOutsideAngular(() => {
      this.updateInterval = setInterval(() => {
        if (this.player && this.player.getCurrentTime) {
          const current = this.player.getCurrentTime();
          // Atualiza dentro do Angular para refletir na UI
          this.ngZone.run(() => {
            this.currentTime = current;
          });
        }
      }, 200); // Atualização fluida a cada 200ms
    });

    // Atualiza duração periodicamente
    setInterval(() => {
      if (this.player && this.player.getDuration) {
        const newDuration = this.player.getDuration();
        if (newDuration !== this.duration) {
          this.ngZone.run(() => {
            this.duration = newDuration;
          });
        }
      }
    }, 5000);
  }

  private onPlayerStateChange(event: any) {
    const YTState = (window as any).YT.PlayerState;

    this.ngZone.run(() => {
      switch (event.data) {
        case YTState.PLAYING:
          this.isPlaying = true;
          break;
        case YTState.PAUSED:
        case YTState.ENDED:
          this.isPlaying = false;
          break;
      }

      if (event.data === YTState.PLAYING) {
        setTimeout(() => {
          if (this.player && this.player.getDuration) {
            this.duration = this.player.getDuration();
          }
        }, 1000);
      }
    });
  }

  private onPlayerError(event: any) {
    console.error('YouTube player error:', event.data);
  }

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

    const YTState = (window as any).YT.PlayerState;

    const state = this.player.getPlayerState();

    if (state === YTState.PAUSED || state === YTState.ENDED) {
      this.player.playVideo();
      this.isPlaying = true;
    } else if (state === YTState.PLAYING) {
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
    const videoContainer = this.youTubePlayer.nativeElement.closest('.video-container');
    if (videoContainer) {
      switch (size) {
        case 'small':
          videoContainer.style.width = '40%';
          videoContainer.style.margin = '0 auto';
          break;
        case 'medium':
          videoContainer.style.width = '70%';
          videoContainer.style.margin = '0 auto';
          break;
        case 'large':
          videoContainer.style.width = '100%';
          videoContainer.style.margin = '0';
          break;
      }
    }
  }

  // Getter para o tamanho atual
  getCurrentSize(): string {
    return this.playerSize;
  }
}