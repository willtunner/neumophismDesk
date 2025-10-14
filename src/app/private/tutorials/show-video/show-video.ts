import { Component, Inject, ViewChild, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { YoutubePlayer } from '../../../shared/components/youtube-player/youtube-player';
import { AnnotationForm } from '../../../shared/components/youtube-player/annotation-form/annotation-form';
import { AnnotationList } from '../../../shared/components/youtube-player/annotation-list/annotation-list';
import { Annotation } from '../../../models/annotation.model';

@Component({
  selector: 'app-show-video',
  standalone: true,
  imports: [
    CommonModule, 
    YoutubePlayer, 
    AnnotationForm, 
    AnnotationList
  ],
  templateUrl: './show-video.html',
  styleUrls: ['./show-video.css']
})
export class ShowVideo {
  @ViewChild('youtubePlayer') youtubePlayer!: YoutubePlayer;
  
  // Signal para armazenar todas as anotações
  private allAnnotations = signal<Annotation[]>(this.loadAnnotationsFromStorage());
  
  // Signal para o timestamp selecionado
  selectedTimestamp = signal<number>(0);
  
  // Computed para as anotações do vídeo atual
  currentAnnotations = computed(() => {
    const videoId = this.extractVideoId(this.data.youtubeUrl);
    return this.allAnnotations().filter(ann => ann.videoId === videoId);
  });

  constructor(
    public dialogRef: MatDialogRef<ShowVideo>,
    @Inject(MAT_DIALOG_DATA) public data: { youtubeUrl: string; title: string }
  ) {}

  // Extrai o ID do vídeo da URL do YouTube
  extractVideoId(url: string): string {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : '';
  }

  // Quando um timestamp é selecionado no player
  onTimestampSelected(timestamp: number): void {
    this.selectedTimestamp.set(timestamp);
  }

  // Quando uma anotação é salva
  onAnnotationSaved(data: { timestamp: number; note: string }): void {
    const videoId = this.extractVideoId(this.data.youtubeUrl);
    const newAnnotation: Annotation = {
      id: this.generateId(),
      videoId: videoId,
      timestamp: data.timestamp,
      note: data.note,
      created: new Date()
    };

    // Atualiza o signal com a nova anotação
    this.allAnnotations.update(annotations => [...annotations, newAnnotation]);
    
    // Salva no localStorage
    this.saveAnnotationsToStorage();
    
    // Reseta o timestamp selecionado
    this.selectedTimestamp.set(0);
  }

  // Quando o formulário é fechado
  onFormClosed(): void {
    this.selectedTimestamp.set(0);
  }

  // Navega para um timestamp específico
  onSeekTo(timestamp: number): void {
    if (this.youtubePlayer) {
      this.youtubePlayer.seekTo(timestamp);
    }
  }

  // Deleta uma anotação
  onDeleteAnnotation(id: string): void {
    this.allAnnotations.update(annotations => 
      annotations.filter(ann => ann.id !== id)
    );
    this.saveAnnotationsToStorage();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  // Gera ID único para anotações
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Carrega anotações do localStorage
  private loadAnnotationsFromStorage(): Annotation[] {
    try {
      const stored = localStorage.getItem('youtube-annotations');
      if (stored) {
        const annotations = JSON.parse(stored);
        // Converte strings de data de volta para objetos Date
        return annotations.map((ann: any) => ({
          ...ann,
          createdAt: new Date(ann.createdAt)
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar anotações:', error);
    }
    return [];
  }

  // Salva anotações no localStorage
  private saveAnnotationsToStorage(): void {
    try {
      localStorage.setItem('youtube-annotations', JSON.stringify(this.allAnnotations()));
    } catch (error) {
      console.error('Erro ao salvar anotações:', error);
    }
  }
}