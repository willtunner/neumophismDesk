import { Component, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ShowVideo } from '../../../private/tutorials/show-video/show-video';
import { DropdownService } from '../../../services/dropdown';
import { AddVideoDialog } from './add-video-dialog/add-video-dialog';

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
  constructor(public dialog: MatDialog, private dropdownService: DropdownService) {}

  openedDropdown: number | null = null;
  hoveredCategory: number | null = null;

  /** Categorias padrão */
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
          youtubeUrl: 'https://www.youtube.com/watch?v=vvDslfWvg6M',
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
          youtubeUrl: 'https://www.youtube.com/watch?v=vvDslfWvg6M',
          addedDate: new Date('2025-03-28'),
          sector: 'Operacional'
        },
        {
          id: 6,
          title: 'Inventário periódico',
          youtubeUrl: 'https://www.youtube.com/watch?v=vvDslfWvg6M',
          addedDate: new Date('2025-03-25'),
          sector: 'Contábil'
        }
      ]
    }
  ];

  /** Computed para ler as categorias do signal */
  videoCategories = computed(() => this.dropdownService.categories());

  ngOnInit() {
    this.dropdownService.initialize(this.defaultCategories);
  }

  toggleDropdown(categoryId: number): void {
    this.openedDropdown = this.openedDropdown === categoryId ? null : categoryId;
  }

  getYouTubeThumbnail(url: string): string {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : '';
  }

  openVideoDialog(video: Video): void {
    this.dialog.open(ShowVideo, {
      width: '80%',
      maxWidth: '800px',
      data: { youtubeUrl: video.youtubeUrl, title: video.title },
      panelClass: 'neu-modal'
    });
  }

  openAddVideoDialog(category?: VideoCategory) {
    const dialogRef = this.dialog.open(AddVideoDialog, {
      width: '800px',
      data: category,
      panelClass: 'neu-modal'
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
  
      const { id, categoryTitle, updatedVideos } = result;
  
      if (id) {
        // ✅ Atualiza categoria existente
        const updatedCategory: VideoCategory = {
          id,
          title: categoryTitle,
          videos: updatedVideos
        };
        this.dropdownService.updateCategory(updatedCategory);
      } else {
        // ✅ Cria nova categoria
        const newCategory: VideoCategory = {
          id: Date.now(),
          title: categoryTitle,
          videos: updatedVideos
        };
        this.dropdownService.addCategory(newCategory);
      }
    });
  }
  

  // Edita uma categoria abrindo a modal com valores preenchidos
  editCategory(category: VideoCategory) {
    const dialogRef = this.dialog.open(AddVideoDialog, {
      width: '800px',
      data: {
        categoryTitle: category.title,
        videos: [...category.videos] // cópia segura
      },
      panelClass: 'neu-modal'
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updatedCategory: VideoCategory = {
          ...category,
          title: result.categoryTitle,
          videos: result.updatedVideos || category.videos
        };
  
        this.dropdownService.updateCategory(updatedCategory);
      }
    });
  }

// Exclui uma categoria inteira
deleteCategory(categoryId: number) {
  this.dropdownService.removeCategory(categoryId);
}

// Edita um vídeo específico
editVideo(category: VideoCategory, video: Video) {
  const dialogRef = this.dialog.open(AddVideoDialog, {
    width: '650px',
    data: {
      categoryTitle: category.title,
      video
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      const updatedVideos = category.videos.map(v =>
        v.id === video.id ? { ...v, ...result.video } : v
      );
      this.dropdownService.updateCategory({ ...category, videos: updatedVideos });
    }
  });
}

// Deleta um vídeo específico
deleteVideo(categoryId: number, videoId: number) {
  const category = this.dropdownService.categories().find(c => c.id === categoryId);
  if (!category) return;
  const updatedVideos = category.videos.filter(v => v.id !== videoId);
  this.dropdownService.updateCategory({ ...category, videos: updatedVideos });
}

}
