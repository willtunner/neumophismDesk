import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { YoutubePlayer } from '../../../shared/components/youtube-player/youtube-player';

@Component({
  selector: 'app-show-video',
  standalone: true,
  imports: [CommonModule, YoutubePlayer],
  templateUrl: './show-video.html',
  styleUrls: ['./show-video.css']
})
export class ShowVideo {
  
  constructor(
    public dialogRef: MatDialogRef<ShowVideo>,
    @Inject(MAT_DIALOG_DATA) public data: { youtubeUrl: string; title: string }
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }

  // Extrai o ID do vídeo da URL do YouTube
  extractVideoId(url: string): string {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : '';
  }
}