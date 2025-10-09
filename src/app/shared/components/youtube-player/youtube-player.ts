// components/youtube-player/youtube-player.component.ts
import { Component, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-youtube-player',
  imports: [CommonModule],
  templateUrl: './youtube-player.html',
  styleUrl: './youtube-player.css'
})
export class YoutubePlayer {
@ViewChild('youTubePlayer') youTubePlayer!: ElementRef;
  @Output() timestampSelected = new EventEmitter<number>();
  @Input() videoId: string = '';
  
  private player: any;
  public currentTime: number = 0;

  ngAfterViewInit() {
    this.loadYouTubeAPI();
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
      height: '360',
      width: '640',
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
    setInterval(() => {
      if (this.player && this.player.getCurrentTime) {
        this.currentTime = this.player.getCurrentTime();
      }
    }, 1000);
  }

  private onPlayerStateChange(event: any) {
    // Pode adicionar lógica adicional aqui se necessário
  }

  getCurrentTime() {
    if (this.player) {
      const time = this.player.getCurrentTime();
      this.timestampSelected.emit(time);
    }
  }

  seekTo(timestamp: number) {
    if (this.player) {
      this.player.seekTo(timestamp, true);
    }
  }
}
