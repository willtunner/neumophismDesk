import { Component, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ShowVideo } from '../../../private/tutorials/show-video/show-video';
import { DropdownService } from '../../../services/dropdown';
import { AddVideoDialog } from './add-video-dialog/add-video-dialog';
import { Tutorial, Video } from '../../../models/models';


@Component({
  selector: 'app-video-dropdown',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './video-dropdown.html',
  styleUrls: ['./video-dropdown.css'],
  providers: [DatePipe]
})
export class VideoDropdownComponent {
  constructor(public dialog: MatDialog, private dropdownService: DropdownService) { }

  openedDropdown: string | null = null;
  hoveredCategory: string | null = null;

  /** Categorias padrão */
  defaultCategories: Tutorial[] = [
    {
      id: '1',
      dropdownTitle: 'Emissão de notas',
      helpDeskCompanyId: '123123',
      videos: [
        {
          id: '1',
          videoTitle: 'O QUE É UMA NOTA FISCAL?',
          youtubeUrl: 'https://www.youtube.com/watch?v=sxeU_iPx3bM',
          sector: 'Fiscal'
        },
        {
          id: '2',
          videoTitle: 'Configuração da empresa para emitir notas',
          youtubeUrl: 'https://www.youtube.com/watch?v=Uo9uo67vQgs',
          sector: 'Configuração'
        },
        {
          id: '3',
          videoTitle: 'Como emitir NFe',
          youtubeUrl: 'https://www.youtube.com/watch?v=lIlL-Gn_VY8',
          sector: 'Operacional'
        },
        {
          id: '4',
          videoTitle: 'Emissão de NFe é fácil!',
          youtubeUrl: 'https://www.youtube.com/watch?v=vvDslfWvg6M',
          sector: 'Tutorial'
        }
      ]
    },
    {
      id: '2',
      dropdownTitle: 'Gestão de Estoque',
      helpDeskCompanyId: '123123',
      videos: [
        {
          id: '1',
          videoTitle: 'Controle de entrada e saída',
          youtubeUrl: 'https://www.youtube.com/watch?v=vvDslfWvg6M',
          sector: 'Operacional'
        },
        {
          id: '2',
          videoTitle: 'Inventário periódico',
          youtubeUrl: 'https://www.youtube.com/watch?v=vvDslfWvg6M',
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

  toggleDropdown(categoryId: string): void {
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
      data: { youtubeUrl: video.youtubeUrl, title: video.videoTitle },
      panelClass: 'neu-modal'
    });
  }

  openAddVideoDialog(category?: Tutorial) {
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
        const updatedCategory: Tutorial = {
          id,
          dropdownTitle: categoryTitle,
          videos: updatedVideos,
          helpDeskCompanyId: '123123',
        };
        this.dropdownService.updateCategory(updatedCategory);
      } else {
        // ✅ Cria nova categoria
        const newCategory: Tutorial = {
          id: '',
          dropdownTitle: categoryTitle,
          videos: updatedVideos,
          helpDeskCompanyId: '123123',
        };
        this.dropdownService.addCategory(newCategory);
      }
    });
  }


  // Exclui uma categoria inteira
  deleteCategory(categoryId: string) {
    this.dropdownService.removeCategory(categoryId);
  }

  // Edita um vídeo específico
  editVideo(category: Tutorial, video: Video) {
    const dialogRef = this.dialog.open(AddVideoDialog, {
      width: '650px',
      data: {
        categoryTitle: category.dropdownTitle,
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
  deleteVideo(categoryId: string, videoId: string) {
    const category = this.dropdownService.categories().find(c => c.id === categoryId);
    if (!category) return;
    const updatedVideos = category.videos.filter((v: Video) => v.id !== videoId);
    this.dropdownService.updateCategory({ ...category, videos: updatedVideos });
  }

}
