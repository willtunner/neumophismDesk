import { CommonModule } from '@angular/common';
import {
  Component,
  forwardRef,
  Input,
  OnInit,
  DoCheck,
  Injector,
  OnDestroy
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  NgControl,
  FormsModule,
  Validators,
  FormControl
} from '@angular/forms';
import { Subject } from 'rxjs';
import { QuillModule } from 'ngx-quill';
import { RichTextConfig } from '../../../interfaces/rich-text-config.interface';

@Component({
  selector: 'app-rich-text-dynamic',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule],
  templateUrl: './rich-text-dynamic.html',
  styleUrls: ['./rich-text-dynamic.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextDynamicComponent),
      multi: true
    }
  ]
})
export class RichTextDynamicComponent implements ControlValueAccessor, OnInit, DoCheck, OnDestroy {
  @Input() config!: RichTextConfig;
  @Input() control!: FormControl;
  @Input() showImage: boolean = true;
  @Input() count: boolean = false; // Novo: Mostrar contador
  @Input() limit: number = 0; // Novo: Limite de caracteres

  value: string = '';
  focused: boolean = false;
  errorState: boolean = false;
  errorMessage: string = '';
  characterCount: number = 0;
  
  private destroyed$ = new Subject<void>();
  ngControl: NgControl | null = null;

  // Módulos do Quill
  quillModules = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        'image': this.imageHandler.bind(this)
      }
    }
  };

  editorStyles = {
    height: '200px',
    backgroundColor: 'transparent'
  };

  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private injector: Injector) {}

  ngOnInit(): void {
    // Atualizar estilos baseados na configuração
    if (this.config) {
      this.editorStyles = {
        height: this.config.minHeight || '200px',
        backgroundColor: 'transparent'
      };
    }

    // Configurar ngControl e validações
    setTimeout(() => {
      this.ngControl = this.injector.get(NgControl, null);
      this.setupValidators();
    });

    // Inicializar contador
    this.updateCharacterCount();
  }

  ngDoCheck(): void {
    if (this.ngControl) {
      const newErrorState = !!this.ngControl.invalid && !!this.ngControl.touched;
      if (newErrorState !== this.errorState) {
        this.errorState = newErrorState;
        this.updateErrorMessage();
      }
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private setupValidators(): void {
    if (!this.control) {
      console.warn('FormControl não fornecido para o rich text dinâmico');
      return;
    }

    const validators = [];

    // Validação obrigatória
    if (this.config.required) {
      validators.push(Validators.required);
    }

    // Validação de comprimento mínimo
    if (this.config.minLength) {
      validators.push(Validators.minLength(this.config.minLength));
    }

    // Validação de comprimento máximo
    if (this.config.maxLength) {
      validators.push(Validators.maxLength(this.config.maxLength));
    }

    // Validação customizada para limite
    if (this.limit > 0) {
      validators.push(this.limitValidator.bind(this));
    }

    this.control.setValidators(validators);
    this.control.updateValueAndValidity();
  }

  private limitValidator(control: FormControl): { [key: string]: any } | null {
    if (!control.value) return null;
    
    const textContent = this.stripHtml(control.value);
    return textContent.length > this.limit ? { limitExceeded: true } : null;
  }

  private updateCharacterCount(): void {
    if (this.value) {
      const textContent = this.stripHtml(this.value);
      this.characterCount = textContent.length;
    } else {
      this.characterCount = 0;
    }
  }

  private stripHtml(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  private updateErrorMessage(): void {
    if (this.control.invalid && this.control.touched) {
      const errors = this.control.errors;
      if (errors) {
        const firstErrorKey = Object.keys(errors)[0];
        const errorValue = errors[firstErrorKey];
        
        // Verificar mensagens customizadas de forma type-safe
        if (this.config.customErrorMessages) {
          if (firstErrorKey === 'required' && this.config.customErrorMessages.required) {
            this.errorMessage = this.config.customErrorMessages.required;
          } else if (firstErrorKey === 'minlength' && this.config.customErrorMessages.minlength) {
            this.errorMessage = this.config.customErrorMessages.minlength;
          } else if (firstErrorKey === 'maxlength' && this.config.customErrorMessages.maxlength) {
            this.errorMessage = this.config.customErrorMessages.maxlength;
          } else if (firstErrorKey === 'limitExceeded') {
            this.errorMessage = `Character limit exceeded by ${this.characterCount - this.limit}`;
          } else {
            this.errorMessage = 'Invalid value';
          }
        } else {
          // Sem mensagens customizadas
          switch (firstErrorKey) {
            case 'required':
              this.errorMessage = 'This field is required';
              break;
            case 'minlength':
              this.errorMessage = `Minimum length is ${errorValue.requiredLength} characters`;
              break;
            case 'maxlength':
              this.errorMessage = `Maximum length is ${errorValue.requiredLength} characters`;
              break;
            case 'limitExceeded':
              this.errorMessage = `Character limit exceeded by ${this.characterCount - this.limit}`;
              break;
            default:
              this.errorMessage = 'Invalid value';
          }
        }
      }
    } else {
      this.errorMessage = '';
    }
  }

  // Handler para imagens
  imageHandler(): void {
    const url = prompt('Enter image URL:');
    if (url) {
      console.log('Inserting image:', url);
    }
  }

  // ControlValueAccessor
  writeValue(value: any): void {
    this.value = value || '';
    this.updateCharacterCount();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.config) {
      this.config.disabled = isDisabled;
    }
  }

  // Event handlers
  onContentChange(content: string): void {
    this.value = content;
    this.updateCharacterCount();
    this.onChange(this.value);
    this.onTouched();
    
    // Atualizar validações em tempo real
    if (this.control) {
      this.control.updateValueAndValidity();
      this.updateErrorMessage();
    }
  }

  onFocus(): void {
    this.focused = true;
  }

  onBlur(): void {
    this.focused = false;
    this.onTouched();
    if (this.control) {
      this.control.markAsTouched();
      this.updateErrorMessage();
    }
  }

  // Getters
  get empty(): boolean {
    return !this.value || this.value === '<p><br></p>' || this.value === '';
  }

  get hasValue(): boolean {
    return !this.empty;
  }

  get disabled(): boolean {
    return this.config?.disabled || false;
  }

  get isInvalid(): boolean {
    return this.control?.invalid && this.control?.touched || false;
  }

  get showCount(): boolean {
    return this.count || this.limit > 0;
  }

  get showLimit(): boolean {
    return this.limit > 0;
  }

  get isLimitExceeded(): boolean {
    return this.limit > 0 && this.characterCount > this.limit;
  }
}