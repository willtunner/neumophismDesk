import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, AbstractControl } from '@angular/forms';
import { SelectConfig, SelectOption } from '../../../interfaces/select-config.interface';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-select-dynamic',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './select-dynamic.html',
  styleUrls: ['./select-dynamic.css']
})
export class SelectDynamicComponent implements OnInit {
  @Input() config!: SelectConfig;
  @Input() set control(abstractControl: AbstractControl) {
    this._control = abstractControl as FormControl;
  }
  get control(): FormControl {
    return this._control;
  }
  private _control!: FormControl;

  @Input() showImage: boolean = true;

  errorMessage: string = '';
  isFocused: boolean = false;
  safeIconSvg: SafeHtml = '';
  isOpen: boolean = false;
  selectedLabels: string = '';

  private readonly defaultIcon = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M6 9l6 6 6-6"/>
    </svg>
  `;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.addEmptyOptionIfRequired();
    this.setupValueChanges();
    this.updateIcon();
    this.updateSelectedLabels();
  }

  private addEmptyOptionIfRequired(): void {
    // Adiciona opção vazia se for required e não houver uma opção vazia
    if (this.config.required && this.config.options.length > 0) {
      const hasEmptyOption = this.config.options.some(option => 
        option.value === null || option.value === undefined || option.value === ''
      );
      
      if (!hasEmptyOption) {
        this.config.options = [
          { value: '', label: `Selecione ${this.config.label.toLowerCase()}`, disabled: false },
          ...this.config.options
        ];
      }
    }
  }

  private setupValueChanges(): void {
    this.control.valueChanges.subscribe(() => {
      this.updateSelectedLabels();
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
        
        if (this.config.customErrorMessages && this.config.customErrorMessages[firstErrorKey]) {
          this.errorMessage = this.config.customErrorMessages[firstErrorKey];
        } else {
          this.errorMessage = this.getDefaultErrorMessage(firstErrorKey);
        }
      }
    } else {
      this.errorMessage = '';
    }
  }

  private getDefaultErrorMessage(errorKey: string): string {
    const errorMessages: { [key: string]: string } = {
      'required': `${this.config.label} é obrigatório`,
      'invalid': `${this.config.label} é inválido`
    };

    return errorMessages[errorKey] || 'Campo inválido';
  }

  private updateIcon(): void {
    const iconSvg = this.getIconSvg();
    this.safeIconSvg = this.sanitizer.bypassSecurityTrustHtml(iconSvg);
  }

  private getIconSvg(): string {
    if (this.config.customIcon) {
      return this.config.customIcon;
    }
    
    if (this.config.iconName) {
      return this.getMaterialIcon(this.config.iconName);
    }
    
    return this.defaultIcon;
  }

  private getMaterialIcon(iconName: string): string {
    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <text x="12" y="16" text-anchor="middle" font-size="10" fill="currentColor">${iconName.charAt(0)}</text>
      </svg>
    `;
  }

  private updateSelectedLabels(): void {
    const value = this.control.value;
    
    if (this.config.multiple && Array.isArray(value) && value.length > 0) {
      const selectedOptions = this.config.options.filter(option => 
        value.includes(option.value)
      );
      this.selectedLabels = selectedOptions.map(option => option.label).join(', ');
    } else if (!this.config.multiple && value !== null && value !== undefined && value !== '') {
      const selectedOption = this.config.options.find(option => option.value === value);
      this.selectedLabels = selectedOption ? selectedOption.label : '';
    } else {
      this.selectedLabels = '';
    }
  }

  onFocus(): void {
    this.isFocused = true;
  }

  onBlur(): void {
    this.isFocused = false;
    this.isOpen = false;
    this.markAsTouched();
  }

  markAsTouched(): void {
    if (!this.control.touched) {
      this.control.markAsTouched();
      this.updateErrorMessage();
    }
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectOption(option: SelectOption): void {
    if (option.disabled) return;

    if (this.config.multiple) {
      const currentValue = this.control.value || [];
      const index = currentValue.indexOf(option.value);
      
      if (index > -1) {
        currentValue.splice(index, 1);
      } else {
        currentValue.push(option.value);
      }
      
      this.control.setValue([...currentValue]);
    } else {
      this.control.setValue(option.value);
      this.isOpen = false;
    }
    
    // Marca como touched e atualiza mensagens
    this.markAsTouched();
  }

  isSelected(option: SelectOption): boolean {
    const value = this.control.value;
    
    if (this.config.multiple) {
      return Array.isArray(value) && value.includes(option.value);
    } else {
      return value === option.value;
    }
  }

  get hasValue(): boolean {
    const value = this.control.value;
    
    if (this.config.multiple) {
      return Array.isArray(value) && value.length > 0;
    } else {
      return value !== null && value !== undefined && value !== '';
    }
  }

  get isInvalid(): boolean {
    return this.control.invalid && (this.control.touched || this.control.dirty);
  }

  get displayValue(): string {
    if (this.selectedLabels) {
      return this.selectedLabels;
    }
    
    return this.config.placeholder || `Selecione ${this.config.label.toLowerCase()}`;
  }
}