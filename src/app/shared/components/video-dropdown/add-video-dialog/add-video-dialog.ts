import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InputDynamicComponent } from '../../input-dynamic/input-dynamic';
import { SelectDynamicComponent } from '../../select-dynamic/select-dynamic';
import { InputType } from '../../../../enuns/input-types.enum';
import { InputConfig } from '../../../../interfaces/input-config.interface';
import { SelectConfig } from '../../../../interfaces/select-config.interface';
import { DropDownVideos, Video } from '../../../../models/models';

@Component({
  selector: 'app-add-video-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputDynamicComponent, SelectDynamicComponent],
  templateUrl: './add-video-dialog.html',
  styleUrls: ['./add-video-dialog.css']
})
export class AddVideoDialog implements OnInit {
  dropDownForm!: FormGroup;
  videoForm!: FormGroup;
  dropDownVideos!: DropDownVideos;

  selectedVideo: Video | null = null;
  isEditMode = false;
  showNewVideo = false;

  inputConfigs!: {
    dropdownTitle: InputConfig;
    videoTitle: InputConfig;
    youtubeUrl: InputConfig;
    sector: SelectConfig;
  };

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddVideoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DropDownVideos | null
  ) {
    console.log('Dropdown Video', data);
  }

  ngOnInit() {
    this.initForms();
    this.initConfigs();
    this.loadData(this.data);
  }

  /** 🔹 Inicializa formulários */
  private initForms(): void {
    this.dropDownForm = this.fb.group({
      dropdownTitle: ['', Validators.required]
    });

    this.videoForm = this.fb.group({
      videoTitle: ['', Validators.required],
      youtubeUrl: ['', [Validators.required, this.youtubeUrlValidator]],
      sector: ['', Validators.required]
    });
  }

    /** 🔹 Carrega dados da categoria recebida */
    private loadData(data: DropDownVideos | null): void {
      this.isEditMode = !!data;
  
      // Se data for null, estamos criando uma nova categoria
      if (!data) {
        this.dropDownVideos = { id: Date.now().toString(), dropdownTitle: '', videos: [] };
        // Mostra automaticamente os campos de novo vídeo para nova categoria
        this.showNewVideo = true;
      } else {
        // Se data existe, estamos editando uma categoria existente
        this.dropDownVideos = { ...data, videos: Array.isArray(data.videos) ? data.videos : [] };
        this.dropDownForm.patchValue({ dropdownTitle: this.dropDownVideos.dropdownTitle });
        // Não mostra automaticamente os campos de vídeo no modo edição
        this.showNewVideo = false;
      }
    }

  /** 🔹 Configura inputs dinâmicos */
  private initConfigs(): void {
    this.inputConfigs = {
      dropdownTitle: {
        type: InputType.TEXT,
        formControlName: 'dropdownTitle',
        label: '🎬 Título da Categoria',
        placeholder: 'Ex: Emissão de Notas Fiscais',
        required: true
      },
      videoTitle: {
        type: InputType.TEXT,
        formControlName: 'videoTitle',
        label: '📹 Título do Vídeo',
        placeholder: 'Ex: Como emitir NFe passo a passo',
        required: true
      },
      youtubeUrl: {
        type: InputType.TEXT,
        formControlName: 'youtubeUrl',
        label: '🔗 URL do YouTube',
        placeholder: 'https://www.youtube.com/watch?v=...',
        required: true
      },
      sector: {
        formControlName: 'sector',
        label: '🏢 Setor',
        placeholder: 'Selecione o setor',
        required: true,
        options: [
          { value: 'Fiscal', label: 'Fiscal' },
          { value: 'Financeiro', label: 'Financeiro' },
          { value: 'Operacional', label: 'Operacional' },
          { value: 'Comercial', label: 'Comercial' },
          { value: 'RH', label: 'Recursos Humanos' },
          { value: 'TI', label: 'Tecnologia da Informação' },
          { value: 'Marketing', label: 'Marketing' },
          { value: 'Jurídico', label: 'Jurídico' },
          { value: 'Configuração', label: 'Configuração' },
          { value: 'Tutorial', label: 'Tutorial' }
        ],
        customIcon: `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9v-9m0-9v9"/>
          </svg>
        `,
        customErrorMessages: {
          required: 'Please select a country'
        }
      }
    };
  }

  /** 🔹 Validador de URL do YouTube */
  private youtubeUrlValidator(control: FormControl) {
    if (!control.value) return null;
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return pattern.test(control.value) ? null : { invalidYoutubeUrl: true };
  }

  /** 🔹 Getters */
  get dropdownTitleControl() { return this.dropDownForm.get('dropdownTitle') as FormControl; }
  get videoTitleControl() { return this.videoForm.get('videoTitle') as FormControl; }
  get youtubeUrlControl() { return this.videoForm.get('youtubeUrl') as FormControl; }
  get sectorControl() { return this.videoForm.get('sector') as FormControl; }
  get hasVideos(): boolean { return this.dropDownVideos.videos.length > 0; }

  /** 🔹 Selecionar vídeo da lista */
  selectVideo(video: Video) {
    this.selectedVideo = video;
    this.videoForm.patchValue(video);
    this.showNewVideo = true;
  }

  /** 🔹 Adicionar novo vídeo */
  addNewVideo() {
    this.selectedVideo = null;
    this.clearVideoFields();
    this.showNewVideo = true;
  }

  /** 🔹 Salvar vídeo (novo ou edição) */
  saveVideo() {
    if (this.videoForm.invalid) {
      this.markFormTouched(this.videoForm);
      return;
    }

    const newVideo: Video = {
      id: this.selectedVideo?.id || Date.now().toString(),
      videoTitle: this.videoForm.value.videoTitle,
      youtubeUrl: this.videoForm.value.youtubeUrl,
      sector: this.videoForm.value.sector
    };

    if (this.selectedVideo) {
      // Editar vídeo existente
      const index = this.dropDownVideos.videos.findIndex(v => v.id === this.selectedVideo!.id);
      this.dropDownVideos.videos[index] = newVideo;
    } else {
      // Adicionar novo vídeo
      this.dropDownVideos.videos.push(newVideo);
    }

    // Limpar campos após salvar
    this.clearVideoFields();
    
    // Desselecionar qualquer vídeo
    this.selectedVideo = null;

    // MANTER O FORMULÁRIO VISÍVEL para adicionar mais vídeos
    // Não alteramos o showNewVideo - mantém como está (true)

    console.log('Vídeo salvo. Lista atual:', this.dropDownVideos.videos);
  }

  /** 🔹 Excluir vídeo */
  deleteVideo(video: Video) {
    if (confirm('Tem certeza que deseja excluir este vídeo?')) {
      this.dropDownVideos.videos = this.dropDownVideos.videos.filter(v => v.id !== video.id);
      if (this.selectedVideo?.id === video.id) {
        this.clearVideoForm();
        this.selectedVideo = null;
      }
    }
  }

  /** 🔹 Salvar categoria */
  save() {
    if (this.dropDownForm.invalid) {
      this.markFormTouched(this.dropDownForm);
      return;
    }

    if (!this.isEditMode && this.dropDownVideos.videos.length === 0) {
      alert('Adicione pelo menos um vídeo antes de salvar.');
      return;
    }

    const result = {
      dropdownTitle: this.dropdownTitleControl.value,
      videos: this.dropDownVideos.videos
    };

    console.log('Objeto completo a ser salvo:', JSON.stringify(result, null, 2));
    
    // this.dialogRef.close(result);
  }

  cancel() { this.dialogRef.close(null); }

  /** 🔹 Utils */
  private clearVideoForm() { 
    this.videoForm.reset(); 
    this.videoForm.markAsPristine();
    this.videoForm.markAsUntouched();
  }


  private markFormTouched(form: FormGroup) {
    Object.values(form.controls).forEach(c => {
      c.markAsTouched();
      if (c instanceof FormGroup) {
        this.markFormTouched(c);
      }
    });
  }

  /** 🔹 YouTube thumbnail helper */
  getYouTubeThumbnail(url: string): string {
    const id = this.extractYouTubeId(url);
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
  }

  private extractYouTubeId(url: string): string {
    const match = url.match(/(?:youtube\.com.*v=|youtu\.be\/)([^&?\/]+)/);
    return match ? match[1] : 'default';
  }

  handleImageError(event: Event) {
    (event.target as HTMLImageElement).src =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA4MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHJ4PSI4IiBmaWxsPSIjRUVFRUVFIi8+PHBhdGggZD0iTTQwIDMwQzQzLjMxMzcgMzAgNDYgMjcuMzEzNyA0NiAyNEM0NiAyMC42ODYzIDQzLjMxMzcgMTggNDAgMThDMzYuNjg2MyAxOCAzNCAyMC42ODYzIDM0IDI0QzM0IDI3LjMxMzcgMzYuNjg2MyAzMCA0MCAzMFoiIGZpbGw9IiM5OTk5OTkiLz48cGF0aCBkPSJNNDggNDJIMzJDMTYgNDIgMTYgNDIgMTYgNDJWMThDMTYgMTYgMTggMTYgMTggMTZINjJDNjIgMTYgNjQgMTYgNjQgMThWNDJDNjQgNDIgNjQgNDIgNjQgNDJDNjQgNDIgNDggNDIgNDggNDJaIiBmaWxsPSIjOTk5OTk5Ii8+PC9zdmc+';
  }

  /** Limpar campos de vídeo */
  private clearVideoFields() {
    this.videoForm.patchValue({ videoTitle: '', youtubeUrl: '', sector: '' });
    this.videoTitleControl.markAsPristine();
    this.youtubeUrlControl.markAsPristine();
    this.sectorControl.markAsPristine();
  }

  /** Cancelar edição de vídeo (apenas limpa e oculta os campos se estivermos em edição) */
  cancelVideoEdit() {
    this.selectedVideo = null;
    this.clearVideoFields();
    // No modo nova categoria, mantém os campos de vídeo visíveis para adicionar mais
    // No modo edição, esconde os campos de vídeo apenas se o usuário clicar em Cancelar
    if (this.isEditMode) {
      this.showNewVideo = false;
    }
  }
}