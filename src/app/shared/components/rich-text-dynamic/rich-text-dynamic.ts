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
} from '@angular/forms';
import { Subject } from 'rxjs';
import { QuillModule } from 'ngx-quill';

export interface RichTextConfig {
  type: 'rich-text';
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
  minHeight?: string;
  maxHeight?: string;
}

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
  @Input() control: any;
  @Input() showImage: boolean = true;

  value: string = '';
  focused: boolean = false;
  errorState: boolean = false;
  private destroyed$ = new Subject<void>();
  ngControl: NgControl | null = null;

  // Módulos do Quill - ATUALIZADO
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

  // CORREÇÃO: Inicializar com valor padrão
  editorStyles = {
    height: '200px',
    backgroundColor: 'transparent'
  };

  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private injector: Injector) {}

  ngOnInit(): void {
    // CORREÇÃO: Atualizar estilos apenas se config existir
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
  }

  ngDoCheck(): void {
    if (this.ngControl) {
      const newErrorState = !!this.ngControl.invalid && !!this.ngControl.touched;
      if (newErrorState !== this.errorState) {
        this.errorState = newErrorState;
      }
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  // Handler para imagens
  imageHandler(): void {
    const range = this.getCurrentRange();
    const url = prompt('Enter image URL:');
    
    if (url) {
      // Insere a imagem no editor
      this.quillModulesInsertImage(url, range);
    }
  }

  // Método auxiliar para inserir imagem
  private quillModulesInsertImage(url: string, range: any): void {
    // Esta função seria chamada pelo handler de imagem
    // Na prática, o Quill já faz isso automaticamente
    console.log('Inserting image:', url);
  }

  // Método auxiliar para obter range atual (simulação)
  private getCurrentRange(): any {
    return { index: 0, length: 0 };
  }

  // ControlValueAccessor
  writeValue(value: any): void {
    this.value = value || '';
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

  // Getters
  get empty(): boolean {
    return !this.value || this.value === '<p><br></p>' || this.value === '';
  }

  get disabled(): boolean {
    return this.config?.disabled || false;
  }

  // Event handlers
  onContentChange(content: string): void {
    this.value = content;
    this.onChange(this.value);
    this.onTouched();
  }

  onFocus(): void {
    this.focused = true;
  }

  onBlur(): void {
    this.focused = false;
    this.onTouched();
  }
}