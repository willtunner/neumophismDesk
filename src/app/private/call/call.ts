import { Component } from '@angular/core';
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

@Component({
  selector: 'app-call',
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    SelectDynamicComponent, 
    ButtonDynamic, 
    InputDynamicComponent,
    RichTextDynamicComponent
  ],
  templateUrl: './call.html',
  styleUrl: './call.css'
})
export class Call {
  callForm: FormGroup;

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

  // Configurações dos componentes
  inputConfigs = {
    empresa: {
      type: InputType.TEXT,
      formControlName: 'empresa',
      label: 'Empresa',
      required: true,
      placeholder: 'Selecione a empresa',
      iconName: 'business',
      customErrorMessages: {
        required: 'Selecione uma empresa'
      }
    } as InputConfig,

    cliente: {
      type: InputType.TEXT,
      formControlName: 'cliente',
      label: 'Cliente',
      required: true,
      placeholder: 'Selecione o cliente',
      iconName: 'person',
      customErrorMessages: {
        required: 'Selecione um cliente'
      }
    } as InputConfig,

    conexao: {
      type: InputType.TEXT,
      formControlName: 'conexao',
      label: 'Conexão',
      required: false,
      placeholder: 'Número da conexão',
      iconName: 'link'
    } as InputConfig,

    titulo: {
      type: InputType.TEXT,
      formControlName: 'titulo',
      label: 'Título',
      required: true,
      placeholder: 'Digite o título',
      iconName: 'title',
      minLength: 2,
      maxLength: 100,
      customErrorMessages: {
        required: 'Digite um título para o chamado',
        minlength: 'O título deve ter pelo menos 2 caracteres',
        maxlength: 'O título deve ter no máximo 100 caracteres'
      }
    } as InputConfig,

    descricao: {
      type: InputType.TEXTAREA,
      formControlName: 'descricao',
      label: 'Descrição',
      required: true,
      placeholder: 'Digite a descrição',
      rows: 4,
      minLength: 10,
      maxLength: 500,
      iconName: 'description',
      customErrorMessages: {
        required: 'Digite uma descrição para o chamado',
        minlength: 'A descrição deve ter pelo menos 10 caracteres',
        maxlength: 'A descrição deve ter no máximo 500 caracteres'
      }
    } as InputConfig
  };

  selectConfigs = {
    empresa: {
      formControlName: 'empresa',
      label: 'Empresa',
      required: true,
      placeholder: 'Selecione a empresa',
      options: [
        { value: 'empresa1', label: 'Empresa A' },
        { value: 'empresa2', label: 'Empresa B' },
        { value: 'empresa3', label: 'Empresa C' }
      ],
      iconName: 'business',
      customErrorMessages: {
        required: 'Selecione uma empresa'
      }
    } as SelectConfig,

    cliente: {
      formControlName: 'cliente',
      label: 'Cliente',
      required: true,
      placeholder: 'Selecione o cliente',
      options: [
        { value: 'cliente1', label: 'Cliente X' },
        { value: 'cliente2', label: 'Cliente Y' },
        { value: 'cliente3', label: 'Cliente Z' }
      ],
      iconName: 'person',
      customErrorMessages: {
        required: 'Selecione um cliente'
      }
    } as SelectConfig,

    conexao: {
      formControlName: 'conexao',
      label: 'Conexão',
      required: false,
      placeholder: 'Tipo de conexão',
      options: [
        { value: 'web', label: 'Web' },
        { value: 'mobile', label: 'Mobile' },
        { value: 'desktop', label: 'Desktop' }
      ],
      iconName: 'link'
    } as SelectConfig
  };

  richTextConfig = {
    formControlName: 'conteudo',
    label: 'Conteúdo',
    required: true,
    placeholder: 'Digite o conteúdo detalhado...',
    minLength: 20,
    maxLength: 500,
    minHeight: '200px',
    customErrorMessages: {
      required: 'Description is required',
      minlength: 'Description must be at least 20 characters',
      maxlength: 'Description cannot exceed 500 characters'
    }
  } as RichTextConfig;

  constructor(private fb: FormBuilder) {
    this.callForm = this.fb.group({
      empresa: ['', Validators.required],
      cliente: ['', Validators.required],
      conexao: [''],
      titulo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      descricao: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      conteudo: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(5000)]]
    });
  }

  ngOnInit(): void {}

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
      this.markAllAsTouchedAndDirty(); // MUDANÇA: Novo método
    }
  }

  private markAllAsTouchedAndDirty(): void {
    Object.keys(this.callForm.controls).forEach(key => {
      const control = this.callForm.get(key);
      if (control) {
        control.markAsTouched();
        control.markAsDirty(); // MUDANÇA: Marca como dirty também
        control.updateValueAndValidity();
      }
    });

    // MUDANÇA: Força a validação do rich text
    this.forceRichTextValidation();
  }

  // NOVO MÉTODO: Forçar validação do rich text
  private forceRichTextValidation(): void {
    // Se você tiver uma referência ao componente rich text, pode chamar validate()
    // Ou força a atualização do controle
    this.conteudoControl.updateValueAndValidity();
    this.conteudoControl.markAsTouched();
    this.conteudoControl.markAsDirty();
  }

}
