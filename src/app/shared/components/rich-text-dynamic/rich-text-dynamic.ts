import { 
  Component, Input, OnInit, Output, EventEmitter, OnDestroy, AfterViewInit, ElementRef 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import Quill from 'quill';
import { RichTextConfig } from '../../../interfaces/rich-text-config.interface';

@Component({
  selector: 'app-rich-text-dynamic',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rich-text-dynamic.html',
  styleUrls: ['./rich-text-dynamic.css']
})
export class RichTextDynamicComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() config!: RichTextConfig;
  @Input() control!: FormControl;
  @Input() showImage: boolean = true;
  @Output() valueChange = new EventEmitter<any>();

  private quill!: Quill;
  errorMessage: string = '';
  isFocused: boolean = false;
  safeIconSvg: SafeHtml = '';
  charCount: number = 0;

  // Ícone SVG para rich text
  private readonly iconSvg = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  `;

  constructor(
    private sanitizer: DomSanitizer,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.setupValidators();
    this.setupValueChanges();
    this.updateIcon();
    // Inicializa o contador com o valor atual do control
    this.updateCharCount();
  }

  ngAfterViewInit(): void {
    // Timeout para garantir que o DOM esteja pronto
    setTimeout(() => {
      this.initializeQuill();
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.quill) {
      this.quill.off('text-change');
    }
  }

  private initializeQuill(): void {
    const editorId = 'quill-editor-' + this.config.formControlName;
    const editorElement = this.elementRef.nativeElement.querySelector(`#${editorId}`);
  
    if (!editorElement) {
      console.error('Editor container not found:', editorId);
      return;
    }
  
    try {
      // Configuração da toolbar
      const toolbarOptions = this.getToolbarOptions();
  
      // Configuração do Quill
      this.quill = new Quill(editorElement, {
        theme: this.config.theme || 'snow',
        modules: {
          toolbar: toolbarOptions
        },
        placeholder: this.config.placeholder || 'Digite seu texto...'
      });

      // Definir altura se fornecida
      if (this.config.height) {
        editorElement.style.height = `${this.config.height}px`;
      }

      // Sincronizar com o FormControl - valor inicial
      if (this.control.value) {
        this.quill.root.innerHTML = this.control.value;
      }
      
      // Atualizar contador com valor inicial
      this.updateCharCount();

      // CORREÇÃO PRINCIPAL: Conectar eventos do Quill
      this.quill.on('text-change', () => {
        const content = this.quill.root.innerHTML;
        
        // Atualizar o FormControl
        this.control.setValue(content);
        
        // Atualizar contador de caracteres
        this.updateCharCount();
        
        // Emitir mudança
        this.valueChange.emit(content);
        
        // Atualizar mensagens de erro
        this.updateErrorMessage();
        
        // Forçar validação
        this.control.updateValueAndValidity();
      });

      // Ouvir foco/blur
      this.quill.on('selection-change', (range) => {
        if (range) {
          this.onFocus();
        } else {
          this.onBlur();
        }
      });

      console.log('Quill editor initialized successfully');

    } catch (error) {
      console.error('Error initializing Quill editor:', error);
    }
  }

  private getToolbarOptions(): any {
    if (Array.isArray(this.config.toolbar)) {
      return this.config.toolbar;
    }

    switch (this.config.toolbar) {
      case 'basic':
        return [
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['link'],
          ['clean']
        ];
      case 'minimal':
        return [
          ['bold', 'italic'],
          ['link'],
          ['clean']
        ];
      case 'full':
      default:
        return [
          [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'script': 'sub' }, { 'script': 'super' }],
          [{ 'header': 1 }, { 'header': 2 }, 'blockquote', 'code-block'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
          [{ 'direction': 'rtl' }, { 'align': [] }],
          ['link', 'image', 'video'],
          ['clean']
        ];
    }
  }

  private setupValidators(): void {
    if (!this.control) {
      console.warn('FormControl não fornecido para o rich text dinâmico');
      return;
    }

    const validators: ValidatorFn[] = [];
    
    if (this.config.required !== false) {
      validators.push(this.requiredValidator.bind(this));
    }
    
    if (this.config.minLength) {
      validators.push(this.minLengthValidator.bind(this));
    }
    
    if (this.config.maxLength) {
      validators.push(this.maxLengthValidator.bind(this));
    }

    this.control.setValidators(validators);
    this.control.updateValueAndValidity();
  }

  private requiredValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value || value === '<p><br></p>' || this.stripHtml(value).trim() === '') {
      return { required: true };
    }
    return null;
  }

  private minLengthValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value || !this.config.minLength) return null;
    
    const text = this.stripHtml(control.value);
    if (text.length < this.config.minLength) {
      return { 
        minlength: {
          requiredLength: this.config.minLength,
          actualLength: text.length
        }
      };
    }
    return null;
  }

  private maxLengthValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value || !this.config.maxLength) return null;
    
    const text = this.stripHtml(control.value);
    if (text.length > this.config.maxLength) {
      return { 
        maxlength: {
          requiredLength: this.config.maxLength,
          actualLength: text.length
        }
      };
    }
    return null;
  }

  private stripHtml(html: string): string {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  private updateCharCount(): void {
    if (this.control.value) {
      const text = this.stripHtml(this.control.value);
      this.charCount = text.length;
    } else {
      this.charCount = 0;
    }
    console.log('Char count updated:', this.charCount); // Para debug
  }

  private setupValueChanges(): void {
    this.control.valueChanges.subscribe(value => {
      this.valueChange.emit(value);
      this.updateCharCount(); // Atualizar contador também nas mudanças do control
      this.updateErrorMessage();
    });

    this.control.statusChanges.subscribe(() => {
      this.updateErrorMessage();
    });
  }

  private updateErrorMessage(): void {
    if (this.control.invalid && (this.control.touched || this.control.dirty)) {
      const errors = this.control.errors;
      if (errors) {
        const firstErrorKey = Object.keys(errors)[0];
        const errorValue = errors[firstErrorKey];
        
        if (this.config.customErrorMessages && this.config.customErrorMessages[firstErrorKey]) {
          this.errorMessage = this.config.customErrorMessages[firstErrorKey];
        } else {
          this.errorMessage = this.getDefaultErrorMessage(firstErrorKey, errorValue);
        }
      }
    } else {
      this.errorMessage = '';
    }
  }

  private getDefaultErrorMessage(errorKey: string, errorValue: any): string {
    switch (errorKey) {
      case 'required':
        return 'Este campo é obrigatório';
      case 'minlength':
        return `Mínimo de ${errorValue.requiredLength} caracteres necessários (atual: ${errorValue.actualLength})`;
      case 'maxlength':
        return `Máximo de ${errorValue.requiredLength} caracteres permitidos (atual: ${errorValue.actualLength})`;
      default:
        return 'Campo inválido';
    }
  }

  private updateIcon(): void {
    this.safeIconSvg = this.sanitizer.bypassSecurityTrustHtml(this.iconSvg);
  }

  onFocus(): void {
    this.isFocused = true;
  }

  onBlur(): void {
    this.isFocused = false;
    this.control.markAsTouched();
    this.updateErrorMessage();
  }

  get hasValue(): boolean {
    return this.control.value && this.stripHtml(this.control.value).trim().length > 0;
  }

  get isInvalid(): boolean {
    return this.control.invalid && (this.control.touched || this.control.dirty);
  }
}