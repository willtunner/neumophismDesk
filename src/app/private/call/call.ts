import { Component, OnDestroy, OnInit } from '@angular/core';
import { SelectDynamicComponent } from '../../shared/components/select-dynamic/select-dynamic';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectConfig } from '../../interfaces/select-config.interface';
import { ButtonDynamic } from '../../shared/components/button-dynamic/button-dynamic';
import { RichTextConfig } from '../../interfaces/rich-text-config.interface';
import { InputConfig } from '../../interfaces/input-config.interface';
import { InputType } from '../../enuns/input-types.enum';
import { InputDynamicComponent } from '../../shared/components/input-dynamic/input-dynamic';
import { RichTextDynamicComponent } from '../../shared/components/rich-text-dynamic/rich-text-dynamic';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TagsNeuComponent } from '../../shared/components/tags-neu/tags-neu';

@Component({
  selector: 'app-call',
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    SelectDynamicComponent, 
    ButtonDynamic, 
    InputDynamicComponent,
    RichTextDynamicComponent,
    TranslateModule,
    TagsNeuComponent
  ],
  templateUrl: './call.html',
  styleUrl: './call.css'
})
export class Call implements OnInit, OnDestroy {
  callForm: FormGroup;
  private langChangeSubscription!: Subscription;

  // Configurações dos componentes
  inputConfigs: any = {};
  selectConfigs: any = {};
  richTextConfig!: RichTextConfig;

  // Ícones SVG
  readonly addIcon = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  `;

  readonly searchIcon = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  `;

  constructor(
    private fb: FormBuilder, 
    private translate: TranslateService
  ) {
    this.callForm = this.fb.group({
      empresa: ['', Validators.required],
      cliente: ['', Validators.required],
      conexao: [''],
      titulo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      descricao: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      conteudo: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(5000)]]
    });
  }

  ngOnInit(): void {
    // Aguarda as traduções estarem prontas antes de inicializar as configurações
    this.translate.get(['INPUTS-FIELS.COMPANY', 'INPUTS-FIELS.CLIENT']).subscribe(() => {
      this.initializeConfigs();
    });
    
    // Inscreve-se nas mudanças de idioma
    this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateTranslations();
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  private initializeConfigs(): void {
    this.updateInputConfigs();
    this.updateSelectConfigs();
    this.updateRichTextConfig();
  }

  private updateInputConfigs(): void {
    this.inputConfigs = {
      empresa: {
        type: InputType.TEXT,
        formControlName: 'empresa',
        label: this.getTranslation('INPUTS-FIELS.COMPANY'),
        required: true,
        placeholder: this.getTranslation('INPUTS-FIELS.SELECT_COMPANY'),
        iconName: 'business',
        customErrorMessages: {
          required: this.getTranslation('VALIDATOR-ERROR-MESSAGES.REQUIRED')
        }
      } as InputConfig,

      cliente: {
        type: InputType.TEXT,
        formControlName: 'cliente',
        label: this.getTranslation('INPUTS-FIELS.CLIENT'),
        required: true,
        placeholder: this.getTranslation('INPUTS-FIELS.SELECT_CLIENT'),
        iconName: 'person',
        customErrorMessages: {
          required: this.getTranslation('VALIDATOR-ERROR-MESSAGES.REQUIRED')
        }
      } as InputConfig,

      conexao: {
        type: InputType.TEXT,
        formControlName: 'conexao',
        label: this.getTranslation('INPUTS-FIELS.CONECTION'),
        required: false,
        placeholder: this.getTranslation('INPUTS-FIELS.NUMBER_CONECTION_PLACEHOLDER'),
        iconName: 'link'
      } as InputConfig,

      titulo: {
        type: InputType.TEXT,
        formControlName: 'titulo',
        label: this.getTranslation('INPUTS-FIELS.TITLE'),
        required: true,
        placeholder: this.getTranslation('INPUTS-FIELS.PLACEHOLDER_TITLE'),
        iconName: 'title',
        minLength: 2,
        maxLength: 100,
        customErrorMessages: {
          required: this.getTranslation('VALIDATOR-ERROR-MESSAGES.REQUIRED'),
          minlength: this.getTranslationWithParams('VALIDATOR-ERROR-MESSAGES.MINLENGTH', { requiredLength: 2 }),
          maxlength: this.getTranslationWithParams('VALIDATOR-ERROR-MESSAGES.MAXLENGTH', { requiredLength: 100 })
        }
      } as InputConfig,

      descricao: {
        type: InputType.TEXTAREA,
        formControlName: 'descricao',
        label: this.getTranslation('INPUTS-FIELS.DESCRIPTION'),
        required: true,
        placeholder: this.getTranslation('INPUTS-FIELS.PLACEHOLDER_DESCRIPTION'),
        rows: 4,
        minLength: 10,
        maxLength: 500,
        iconName: 'description',
        customErrorMessages: {
          required: this.getTranslation('VALIDATOR-ERROR-MESSAGES.REQUIRED'),
          minlength: this.getTranslationWithParams('VALIDATOR-ERROR-MESSAGES.MINLENGTH', { requiredLength: 10 }),
          maxlength: this.getTranslationWithParams('VALIDATOR-ERROR-MESSAGES.MAXLENGTH', { requiredLength: 500 })
        }
      } as InputConfig
    };
  }

  private updateSelectConfigs(): void {
    this.selectConfigs = {
      empresa: {
        formControlName: 'empresa',
        label: this.getTranslation('INPUTS-FIELS.COMPANY'),
        required: true,
        placeholder: this.getTranslation('INPUTS-FIELS.SELECT_COMPANY'),
        options: [
          { value: 'empresa1', label: 'Empresa A' },
          { value: 'empresa2', label: 'Empresa B' },
          { value: 'empresa3', label: 'Empresa C' }
        ],
        iconName: 'business',
        customErrorMessages: {
          required: this.getTranslation('VALIDATOR-ERROR-MESSAGES.REQUIRED')
        }
      } as SelectConfig,

      cliente: {
        formControlName: 'cliente',
        label: this.getTranslation('INPUTS-FIELS.CLIENT'),
        required: true,
        placeholder: this.getTranslation('INPUTS-FIELS.SELECT_CLIENT'),
        options: [
          { value: 'cliente1', label: 'Cliente X' },
          { value: 'cliente2', label: 'Cliente Y' },
          { value: 'cliente3', label: 'Cliente Z' }
        ],
        iconName: 'person',
        customErrorMessages: {
          required: this.getTranslation('VALIDATOR-ERROR-MESSAGES.REQUIRED')
        }
      } as SelectConfig,

      conexao: {
        formControlName: 'conexao',
        label: this.getTranslation('INPUTS-FIELS.CONECTION'),
        required: false,
        placeholder: this.getTranslation('INPUTS-FIELS.NUMBER_CONECTION_PLACEHOLDER'),
        options: [
          { value: 'web', label: 'Web' },
          { value: 'mobile', label: 'Mobile' },
          { value: 'desktop', label: 'Desktop' }
        ],
        iconName: 'link'
      } as SelectConfig
    };
  }

  private updateRichTextConfig(): void {
    this.richTextConfig = {
      formControlName: 'conteudo',
      label: this.getTranslation('INPUTS-FIELS.CONTENT'),
      required: true,
      placeholder: this.getTranslation('INPUTS-FIELS.PLACEHOLDER_CONTENT'),
      minLength: 20,
      maxLength: 5000,
      minHeight: '200px',
      customErrorMessages: {
        required: this.getTranslation('VALIDATOR-ERROR-MESSAGES.REQUIRED'),
        minlength: this.getTranslationWithParams('VALIDATOR-ERROR-MESSAGES.MINLENGTH', { requiredLength: 20 }),
        maxlength: this.getTranslationWithParams('VALIDATOR-ERROR-MESSAGES.MAXLENGTH', { requiredLength: 5000 })
      }
    } as RichTextConfig;
  }

  private updateTranslations(): void {
    // Recria completamente as configurações para garantir que todas as traduções sejam atualizadas
    this.updateInputConfigs();
    this.updateSelectConfigs();
    this.updateRichTextConfig();
  }

  // Método auxiliar para obter traduções
  private getTranslation(key: string): string {
    return this.translate.instant(key);
  }

  // Método auxiliar para obter traduções com parâmetros
  private getTranslationWithParams(key: string, params: any): string {
    return this.translate.instant(key, params);
  }

  // Getters para os controles
  get empresaControl(): FormControl {
    return this.callForm.get('empresa') as FormControl;
  }

  get clienteControl(): FormControl {
    return this.callForm.get('cliente') as FormControl;
  }

  get conexaoControl(): FormControl {
    return this.callForm.get('conexao') as FormControl;
  }

  get tituloControl(): FormControl {
    return this.callForm.get('titulo') as FormControl;
  }

  get descricaoControl(): FormControl {
    return this.callForm.get('descricao') as FormControl;
  }

  get conteudoControl(): FormControl {
    return this.callForm.get('conteudo') as FormControl;
  }

  // Métodos para os botões
  onAddEmpresa(): void {
    console.log('Abrir modal para adicionar empresa');
  }

  onAddCliente(): void {
    console.log('Abrir modal para adicionar cliente');
  }

  onSearchConexao(): void {
    console.log('Buscar conexão');
  }

  onSubmit(): void {
    if (this.callForm.valid) {
      console.log('Formulário enviado:', this.callForm.value);
    } else {
      this.markAllAsTouchedAndDirty();
    }
  }

  private markAllAsTouchedAndDirty(): void {
    Object.keys(this.callForm.controls).forEach(key => {
      const control = this.callForm.get(key);
      if (control) {
        control.markAsTouched();
        control.markAsDirty();
        control.updateValueAndValidity();
      }
    });

    this.forceRichTextValidation();
  }

  private forceRichTextValidation(): void {
    this.conteudoControl.updateValueAndValidity();
    this.conteudoControl.markAsTouched();
    this.conteudoControl.markAsDirty();
  }
}