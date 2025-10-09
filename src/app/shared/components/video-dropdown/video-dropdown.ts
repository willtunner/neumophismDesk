import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ShowVideo } from '../../../private/tutorials/show-video/show-video';

export interface Video {
  id: number;
  title: string;
  youtubeUrl: string;
  addedDate: Date;
  sector: string;
}

export interface VideoCategory {
  id: number;
  title: string;
  videos: Video[];
}

@Component({
  selector: 'app-video-dropdown',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './video-dropdown.html',
  styleUrls: ['./video-dropdown.css'],
  providers: [DatePipe]
})
export class VideoDropdownComponent {

  constructor(public dialog: MatDialog) {}

  @Input() videoCategories: VideoCategory[] = [];
  
  openedDropdown: number | null = null;

  // Dados de exemplo baseados na sua imagem
  defaultCategories: VideoCategory[] = [
    {
      id: 1,
      title: 'Emissão de notas',
      videos: [
        {
          id: 1,
          title: 'O QUE É UMA NOTA FISCAL?',
          youtubeUrl: 'https://www.youtube.com/watch?v=sxeU_iPx3bM',
          addedDate: new Date('2025-04-01'),
          sector: 'Fiscal'
        },
        {
          id: 2,
          title: 'Configuração da empresa para emitir notas',
          youtubeUrl: 'https://www.youtube.com/watch?v=Uo9uo67vQgs',
          addedDate: new Date('2025-04-01'),
          sector: 'Configuração'
        },
        {
          id: 3,
          title: 'Como emitir NFe',
          youtubeUrl: 'https://www.youtube.com/watch?v=lIlL-Gn_VY8',
          addedDate: new Date('2025-04-01'),
          sector: 'Operacional'
        },
        {
          id: 4,
          title: 'Emissão de NFe é fácil!',
          youtubeUrl: 'https://www.youtube.com/watch?v=vvDslfWvg6M&pp=ugUHEgVwdC1CUg%3D%3D',
          addedDate: new Date('2025-04-01'),
          sector: 'Tutorial'
        }
      ]
    },
    {
      id: 2,
      title: 'Gestão de Estoque',
      videos: [
        {
          id: 5,
          title: 'Controle de entrada e saída',
          youtubeUrl: 'https://www.youtube.com/watch?v=vvDslfWvg6M&pp=ugUHEgVwdC1CUg%3D%3D',
          addedDate: new Date('2025-03-28'),
          sector: 'Operacional'
        },
        {
          id: 6,
          title: 'Inventário periódico',
          youtubeUrl: 'https://www.youtube.com/watch?v=vvDslfWvg6M&pp=ugUHEgVwdC1CUg%3D%3D',
          addedDate: new Date('2025-03-25'),
          sector: 'Contábil'
        }
      ]
    }
  ];

  ngOnInit() {
    // Se não houver categorias fornecidas via input, usa as padrão
    if (this.videoCategories.length === 0) {
      this.videoCategories = this.defaultCategories;
    }
  }

  toggleDropdown(categoryId: number): void {
    if (this.openedDropdown === categoryId) {
      this.openedDropdown = null;
    } else {
      this.openedDropdown = categoryId;
    }
  }

  getYouTubeThumbnail(url: string): string {
    // Extrai o ID do vídeo da URL do YouTube
    const videoId = this.extractYouTubeId(url);
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }

  private extractYouTubeId(url: string): string {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : 'default';
  }

  openVideoDialog(video: Video): void {
    const dialogRef = this.dialog.open(ShowVideo, {
      width: '80%',
      maxWidth: '800px',
      data: { youtubeUrl: video.youtubeUrl, title: video.title }, // Passe os dados do vídeo
      panelClass: 'neu-modal' // Classe personalizada para o estilo neumórfico
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('A modal foi fechada');
    });
  }
}