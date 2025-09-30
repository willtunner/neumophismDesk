import { CommonModule } from '@angular/common';
import {
  Component,
  forwardRef,
  Input,
  OnInit,
  DoCheck,
  Injector,
  OnDestroy,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  NgControl,
  FormsModule,
  Validators,
  FormControl,
  AbstractControl,
  ValidatorFn
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
export class RichTextDynamicComponent implements ControlValueAccessor, OnInit, DoCheck, OnDestroy, OnChanges {
  @Input() config!: RichTextConfig;
  @Input() control!: FormControl;
  @Input() showImage: boolean = true;
  @Input() count: boolean = false;
  @Input() limit: number = 0;

  value: string = '';
  focused: boolean = false;
  errorState: boolean = false;
  errorMessage: string = '';
  characterCount: number = 0;
  touched: boolean = false;
  
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

  // CORREÇÃO: Usar uma única fonte de verdade para o valor
  private internalValue: string = '';

  onChange = (value: any) => {};
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

    // Configurar ngControl
    setTimeout(() => {
      this.ngControl = this.injector.get(NgControl, null);
    });

    // Sincronizar com o FormControl do pai se existir
    this.syncWithParentControl();

    // Inicializar contador
    this.updateCharacterCount();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Se o control mudar, re-sincronizar
    if (changes['control'] && this.control) {
      this.syncWithParentControl();
    }
  }

  ngDoCheck(): void {
    if (this.control) {
      const newErrorState = this.control.invalid && this.touched;
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

  // CORREÇÃO: Sincronizar com o FormControl do pai
  private syncWithParentControl(): void {
    if (!this.control) return;

    // Sincronizar valor inicial do pai para o componente
    if (this.control.value !== this.internalValue) {
      this.internalValue = this.control.value || '';
      this.value = this.internalValue;
      this.updateCharacterCount();
    }

    // Sincronizar validadores
    this.setupValidators();

    // Observar mudanças do FormControl pai
    this.control.valueChanges.subscribe(value => {
      if (value !== this.internalValue) {
        this.internalValue = value || '';
        this.value = this.internalValue;
        this.updateCharacterCount();
      }
    });

    // Observar status de touched
    this.control.statusChanges.subscribe(() => {
      if (this.control.touched && !this.touched) {
        this.touched = true;
        this.updateErrorMessage();
      }
    });
  }

  private setupValidators(): void {
    if (!this.control) return;

    const validators = [];

    // Validação obrigatória
    if (this.config?.required) {
      validators.push(this.requiredValidator());
    }

    // Validação de comprimento mínimo
    if (this.config?.minLength) {
      validators.push(this.minLengthValidator());
    }

    // Validação de comprimento máximo
    if (this.config?.maxLength) {
      validators.push(this.maxLengthValidator());
    }

    // Validação customizada para limite
    if (this.limit > 0) {
      validators.push(this.limitValidator());
    }

    // Aplicar validadores apenas se houver algum
    if (validators.length > 0) {
      this.control.setValidators(validators);
      this.control.updateValueAndValidity();
    }
  }

  // VALIDADOR REQUIRED
  private requiredValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      
      if (!value || value === '') {
        return { required: true };
      }
      
      const textContent = this.stripHtml(value);
      const hasRealContent = textContent.trim().length > 0;
      
      return hasRealContent ? null : { required: true };
    };
  }

  // VALIDADOR MIN LENGTH
  private minLengthValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      
      if (!value) {
        return this.config.required ? 
          { minlength: { requiredLength: this.config.minLength, actualLength: 0 } } : null;
      }
      
      const textContent = this.stripHtml(value);
      const actualLength = textContent.trim().length;
      
      return actualLength < (this.config.minLength || 0) ? 
        { minlength: { requiredLength: this.config.minLength, actualLength } } : null;
    };
  }

  // VALIDADOR MAX LENGTH
  private maxLengthValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) return null;
      
      const textContent = this.stripHtml(control.value);
      const actualLength = textContent.length;
      
      return actualLength > (this.config.maxLength || 0) ? 
        { maxlength: { requiredLength: this.config.maxLength, actualLength } } : null;
    };
  }

  // VALIDADOR LIMITE
  private limitValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) return null;
      
      const textContent = this.stripHtml(control.value);
      return textContent.length > this.limit ? { limitExceeded: true } : null;
    };
  }

  private updateCharacterCount(): void {
    if (this.internalValue) {
      const textContent = this.stripHtml(this.internalValue);
      this.characterCount = textContent.length;
    } else {
      this.characterCount = 0;
    }
  }

  private stripHtml(html: string): string {
    if (!html) return '';
    
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    
    let text = tmp.textContent || tmp.innerText || '';
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  }

  private updateErrorMessage(): void {
    if (this.control?.invalid && this.touched) {
      const errors = this.control.errors;
      if (errors) {
        const firstErrorKey = Object.keys(errors)[0];
        const errorValue = errors[firstErrorKey];
        
        if (this.config?.customErrorMessages) {
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
          switch (firstErrorKey) {
            case 'required':
              this.errorMessage = 'This field is required';
              break;
            case 'minlength':
              this.errorMessage = `Minimum length is ${errorValue.requiredLength} characters (currently ${errorValue.actualLength})`;
              break;
            case 'maxlength':
              this.errorMessage = `Maximum length is ${errorValue.requiredLength} characters (currently ${errorValue.actualLength})`;
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

  // CORREÇÃO: ControlValueAccessor - Sincronização bidirecional
  writeValue(value: any): void {
    if (value !== this.internalValue) {
      this.internalValue = value || '';
      this.value = this.internalValue;
      this.updateCharacterCount();
    }
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

  // CORREÇÃO: Event handlers - Sincronizar com FormControl pai
  onContentChange(content: string): void {
    this.internalValue = content;
    this.value = this.internalValue;
    this.updateCharacterCount();
    
    // Atualizar ControlValueAccessor
    this.onChange(this.internalValue);
    
    // Atualizar FormControl pai se existir
    if (this.control && this.control.value !== this.internalValue) {
      this.control.setValue(this.internalValue);
      this.control.updateValueAndValidity();
    }
    
    this.updateErrorMessage();
  }

  onFocus(): void {
    this.focused = true;
  }

  onBlur(): void {
    this.focused = false;
    this.markAsTouched();
  }

  // Marcar como touched
  markAsTouched(): void {
    if (!this.touched) {
      this.touched = true;
      this.onTouched();
      
      if (this.control) {
        this.control.markAsTouched();
        this.control.updateValueAndValidity();
        this.updateErrorMessage();
      }
    }
  }

  // GETTERS
  get empty(): boolean {
    if (!this.internalValue) return true;
    const textContent = this.stripHtml(this.internalValue);
    return textContent.trim().length === 0;
  }

  get hasValue(): boolean {
    return !this.empty;
  }

  get disabled(): boolean {
    return this.config?.disabled || false;
  }

  get isInvalid(): boolean {
    return this.control?.invalid && this.touched || false;
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