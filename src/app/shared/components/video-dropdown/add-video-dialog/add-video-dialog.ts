import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InputDynamicComponent } from '../../input-dynamic/input-dynamic';
import { InputType } from '../../../../enuns/input-types.enum';
import { InputConfig } from '../../../../interfaces/input-config.interface';
import { Video,  } from '../../../../models/models';
import { VideoCategory } from '../video-dropdown';

export interface AddVideoDialogData {
  category?: VideoCategory;
  isEdit?: boolean;
  videos?: Video[];
}

@Component({
  selector: 'app-add-video-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputDynamicComponent],
  templateUrl: './add-video-dialog.html',
  styleUrls: ['./add-video-dialog.css']
})
export class AddVideoDialog implements OnInit {
  videoForm: FormGroup;
  videos: Video[] = [];
  showAddVideoFields = false;
  isEditMode = false;

  inputConfigs: Record<string, InputConfig> = {};

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddVideoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: AddVideoDialogData
  ) {
    console.log('Dados recebidos no diálogo:', data);
    this.isEditMode = data?.isEdit || false;
    this.videos = data?.videos || [];

    this.videoForm = this.fb.group({
      categoryTitle: [data?.category?.title || '', Validators.required],
      videoTitle: [''],
      youtubeUrl: ['', [Validators.required, this.youtubeUrlValidator]],
      sector: ['', Validators.required]
    });

    this.initializeConfigs();
  }

  ngOnInit() {
    // Se for modo de criação, mostra os campos de vídeo automaticamente
    if (!this.isEditMode) {
      this.showAddVideoFields = true;
    }
  }

  private initializeConfigs(): void {
    this.inputConfigs = {
      categoryTitle: {
        type: InputType.TEXT,
        formControlName: 'categoryTitle',
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
        type: InputType.SELECT,
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
          { value: 'Jurídico', label: 'Jurídico' }
        ]
      }
    };
  }

  private youtubeUrlValidator(control: FormControl) {
    if (!control.value) {
      return null;
    }
    
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(control.value) ? null : { invalidYoutubeUrl: true };
  }

  get categoryTitleControl(): FormControl {
    return this.videoForm.get('categoryTitle') as FormControl;
  }

  get videoTitleControl(): FormControl {
    return this.videoForm.get('videoTitle') as FormControl;
  }

  get youtubeUrlControl(): FormControl {
    return this.videoForm.get('youtubeUrl') as FormControl;
  }

  get sectorControl(): FormControl {
    return this.videoForm.get('sector') as FormControl;
  }

  /** Alterna modo de adicionar vídeo */
  toggleAddVideo() {
    this.showAddVideoFields = !this.showAddVideoFields;
    if (!this.showAddVideoFields) {
      this.cancelAddVideo();
    }
  }

  deleteVideo(index: number) {
    this.videos.splice(index, 1);
  }

  cancelAddVideo() {
    this.videoForm.patchValue({
      videoTitle: '',
      youtubeUrl: '',
      sector: ''
    });
    this.videoTitleControl.markAsPristine();
    this.youtubeUrlControl.markAsPristine();
    this.sectorControl.markAsPristine();
  }

  saveNewVideo() {
    if (this.videoTitleControl.invalid || this.youtubeUrlControl.invalid || this.sectorControl.invalid) {
      this.markVideoFieldsAsTouched();
      return;
    }

    const { videoTitle, youtubeUrl, sector } = this.videoForm.value;
    
    const newVideo: Video = {
      id: Date.now().toString(),
      title: videoTitle,
      url: youtubeUrl,
      sector,
      created: new Date(),
      nameProfile: 'Usuário'
    };

    this.videos.push(newVideo);
    this.cancelAddVideo();
    
    // Se for modo criação, mantém os campos abertos para adicionar mais vídeos
    if (this.isEditMode) {
      this.showAddVideoFields = false;
    }
  }

  private markVideoFieldsAsTouched() {
    this.videoTitleControl.markAsTouched();
    this.youtubeUrlControl.markAsTouched();
    this.sectorControl.markAsTouched();
  }

  save() {
    if (this.categoryTitleControl.invalid) {
      this.categoryTitleControl.markAsTouched();
      return;
    }

    const result = {
      categoryTitle: this.categoryTitleControl.value,
      videos: [...this.videos],
      isEdit: this.isEditMode
    };

    this.dialogRef.close(result);
  }

  cancel() {
    this.dialogRef.close(null);
  }

  getYouTubeThumbnail(url: string): string {
    const videoId = this.extractYouTubeId(url);
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }

  private extractYouTubeId(url: string): string {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : 'default';
  }

  get hasVideos(): boolean {
    return this.videos.length > 0;
  }

  get canAddVideo(): boolean {
    return this.videoTitleControl.valid && this.youtubeUrlControl.valid && this.sectorControl.valid;
  }
}