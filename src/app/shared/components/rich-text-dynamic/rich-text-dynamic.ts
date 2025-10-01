import { CommonModule } from '@angular/common';
import {
  Component, forwardRef, Input, OnInit, DoCheck,
  Injector, OnDestroy, OnChanges, SimpleChanges
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR, ControlValueAccessor,
  NgControl, FormsModule, FormControl
} from '@angular/forms';
import { Subject } from 'rxjs';
import { QuillModule } from 'ngx-quill';
import { RichTextConfig } from '../../../interfaces/rich-text-config.interface';
import { stripHtml } from './utils/html-utils';
import { buildValidators } from './utils/validators';
import { getErrorMessage } from './utils/error-messages';
import { quillToolbarModules } from './toolbar/quill-toolbar.config';

@Component({
  selector: 'app-rich-text-dynamic',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule],
  templateUrl: './rich-text-dynamic.html',
  styleUrls: ['./rich-text-dynamic.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => RichTextDynamicComponent),
    multi: true
  }]
})
export class RichTextDynamicComponent implements ControlValueAccessor, OnInit, DoCheck, OnDestroy, OnChanges {
  @Input() config!: RichTextConfig;
  @Input() control!: FormControl;
  @Input() showImage = true;
  @Input() count = false;
  @Input() limit = 0;

  value = '';
  focused = false;
  errorState = false;
  errorMessage = '';
  characterCount = 0;
  touched = false;
  isViewMode = false;

  private destroyed$ = new Subject<void>();
  private internalValue = '';
  ngControl: NgControl | null = null;

  quillModules = quillToolbarModules;
  editorStyles = { height: '200px', backgroundColor: 'transparent' };

  constructor(private injector: Injector) {}

  ngOnInit(): void {
    this.initEditorStyles();
    setTimeout(() => (this.ngControl = this.injector.get(NgControl, null)));
    this.syncWithParentControl();
    this.updateCharacterCount();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['control'] && this.control) this.syncWithParentControl();
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

  // FUNÇÃO PARA LIMPAR CONTEÚDO
  clearContent(): void {
    if (this.control) {
      // Limpa o valor do control do componente pai
      this.control.setValue('');
      this.control.markAsTouched();
      this.control.updateValueAndValidity();

      // Atualiza o valor interno do editor
      this.internalValue = '';
      this.value = '';
      this.updateCharacterCount();

      // Notifica o ControlValueAccessor
      this.onChange('');
      this.onTouched();

      // Força a atualização da view
      this.markAsTouched();
    }
  }

  toggleView(): void {
    this.isViewMode = !this.isViewMode;
  }

  private initEditorStyles(): void {
    if (this.config?.minHeight) {
      this.editorStyles = { height: this.config.minHeight, backgroundColor: 'transparent' };
    }
  }

  private syncWithParentControl(): void {
    if (!this.control) return;

    this.internalValue = this.control.value || '';
    this.value = this.internalValue;
    this.updateCharacterCount();

    this.control.setValidators(buildValidators(this.config, this.limit));
    this.control.updateValueAndValidity();

    this.control.valueChanges.subscribe(value => {
      if (value !== this.internalValue) {
        this.internalValue = value || '';
        this.value = this.internalValue;
        this.updateCharacterCount();
      }
    });

    this.control.statusChanges.subscribe(() => {
      if (this.control.touched && !this.touched) {
        this.touched = true;
        this.updateErrorMessage();
      }
    });
  }

  private updateErrorMessage(): void {
    if (this.control?.invalid && this.touched) {
      const errors = this.control.errors;
      if (errors) {
        this.errorMessage = getErrorMessage(errors, this.config, this.limit, this.characterCount);
      }
    } else {
      this.errorMessage = '';
    }
  }

  onContentChange(content: string): void {
    this.internalValue = content;
    this.value = content;
    this.updateCharacterCount();

    this.onChange(this.internalValue);
    this.control?.setValue(this.internalValue);
    this.control?.updateValueAndValidity();

    this.updateErrorMessage();
  }

  onFocus(): void { this.focused = true; }
  onBlur(): void { this.focused = false; this.markAsTouched(); }

  markAsTouched(): void {
    if (!this.touched) {
      this.touched = true;
      this.onTouched();
      this.control?.markAsTouched();
      this.control?.updateValueAndValidity();
      this.updateErrorMessage();
    }
  }

  private updateCharacterCount(): void {
    this.characterCount = stripHtml(this.internalValue).length;
  }

  // ControlValueAccessor
  onChange = (value: any) => {};
  onTouched = () => {};
  writeValue(value: any): void {
    this.internalValue = value || '';
    this.value = this.internalValue;
    this.updateCharacterCount();
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean): void {
    if (this.config) this.config.disabled = isDisabled;
  }

  // GETTERS
  get empty(): boolean {
    return stripHtml(this.internalValue).trim().length === 0;
  }
  get hasValue(): boolean { return !this.empty; }
  get disabled(): boolean { return this.config?.disabled || false; }
  get isInvalid(): boolean { return this.control?.invalid && this.touched || false; }
  get showCount(): boolean { return this.count || this.limit > 0; }
  get showLimit(): boolean { return this.limit > 0; }
  get isLimitExceeded(): boolean { return this.limit > 0 && this.characterCount > this.limit; }
}
