import { CommonModule } from '@angular/common';
import {
  Component,
  forwardRef,
  Input,
  OnInit,
  AfterViewInit,
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

  // Módulos do Quill - CORRIGIDO para funcionar com imagens e formatação
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ]
  };

  // Estilos do editor
  editorStyles = {
    height: this.config?.minHeight || '200px',
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

    // Configurar ngControl
    setTimeout(() => {
      this.ngControl = this.injector.get(NgControl, null);
    });
  }

  ngDoCheck(): void {
    if (this.ngControl) {
      // CORREÇÃO: Usar operador de coalescência nula para tratar valores null/undefined
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