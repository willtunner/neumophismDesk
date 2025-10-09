import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-show-video',
  templateUrl: './show-video.html',
  styleUrls: ['./show-video.css']
})
export class ShowVideo {
  sanitizedUrl: SafeResourceUrl;

  constructor(
    public dialogRef: MatDialogRef<ShowVideo>,
    @Inject(MAT_DIALOG_DATA) public data: { youtubeUrl: string; title: string },
    private sanitizer: DomSanitizer
  ) {
    // Sanitiza a URL do YouTube para evitar problemas de segurança
    const videoId = this.extractVideoId(data.youtubeUrl);
    this.sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1`);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  private extractVideoId(url: string): string {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : 'default';
  }
}