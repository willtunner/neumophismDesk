import { Component, Input, OnInit, OnChanges, SimpleChanges, ElementRef, HostListener, ViewChild, AfterViewInit } from '@angular/core';
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
export class SelectDynamicComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() config!: SelectConfig;
  @Input() set control(abstractControl: AbstractControl) {
    this._control = abstractControl as FormControl;
    this.setupValueChanges();
  }
  get control(): FormControl {
    return this._control;
  }
  private _control!: FormControl;

  @Input() showImage: boolean = true;

  @ViewChild('selectGroup') selectGroup!: ElementRef;

  errorMessage: string = '';
  isFocused: boolean = false;
  safeIconSvg: SafeHtml = '';
  isOpen: boolean = false;
  selectedLabels: string = '';
  hasBeenTouched: boolean = false; // Nova propriedade para controlar touched

  private readonly defaultIcon = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M6 9l6 6 6-6"/>
    </svg>
  `;

  constructor(
    private sanitizer: DomSanitizer,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    if (!this.config) return;
    
    this.addEmptyOptionIfRequired();
    this.updateIcon();
    this.updateSelectedLabels();
    this.updateErrorMessage();
  }

  ngAfterViewInit(): void {
    // Adiciona o event listener para clique fora após a view ser inicializada
    setTimeout(() => {
      document.addEventListener('click', this.handleClickOutside.bind(this));
    });
  }

  ngOnDestroy(): void {
    // Remove o event listener quando o componente é destruído
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  private handleClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const container = this.elementRef.nativeElement;
    
    // Verifica se o clique foi fora do componente
    if (!container.contains(target)) {
      this.closeDropdown();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['control'] && !changes['control'].firstChange) {
      this.setupValueChanges();
      this.updateErrorMessage();
    }
  }

  private addEmptyOptionIfRequired(): void {
    // Evita erro caso o Input ainda não tenha sido inicializado
    if (!this.config || !this.config.options) return;
  
    if (this.config.required && this.config.options.length > 0) {
      const hasEmptyOption = this.config.options.some(option =>
        option.value === null || option.value === undefined || option.value === ''
      );
  
      if (!hasEmptyOption) {
        this.config.options = [
          { value: '', label: `Selecione ${this.config.label?.toLowerCase() || ''}`, disabled: false },
          ...this.config.options
        ];
      }
    }
  }

  private setupValueChanges(): void {
    if (this.control) {
      this.control.valueChanges.subscribe(() => {
        this.updateSelectedLabels();
        this.updateErrorMessage();
      });

      this.control.statusChanges.subscribe(() => {
        this.updateErrorMessage();
      });

      this.updateErrorMessage();
    }
  }

  private updateErrorMessage(): void {
    if (this.control && this.control.invalid && (this.hasBeenTouched || this.control.dirty)) {
      const errors = this.control.errors;
      if (errors) {
        const firstErrorKey = Object.keys(errors)[0];
        
        if (this.config.customErrorMessages && this.config.customErrorMessages[firstErrorKey]) {
          this.errorMessage = this.config.customErrorMessages[firstErrorKey];
        } else {
          this.errorMessage = this.getDefaultErrorMessage(firstErrorKey, errors[firstErrorKey]);
        }
      }
    } else {
      this.errorMessage = '';
    }
  }

  private getDefaultErrorMessage(errorKey: string, errorValue?: any): string {
    const errorMessages: { [key: string]: string } = {
      'required': `${this.config.label} é obrigatório`,
      'minlength': `Mínimo de ${errorValue?.requiredLength} caracteres`,
      'maxlength': `Máximo de ${errorValue?.requiredLength} caracteres`,
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
    if (!this.control) return;
    
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
    // MUDANÇA: Não marca como touched automaticamente no blur
    // Apenas atualiza a mensagem de erro se já foi tocado
    this.updateErrorMessage();
  }

  private closeDropdown(): void {
    this.isOpen = false;
    // MUDANÇA: Não marca como touched automaticamente ao fechar dropdown
    this.updateErrorMessage();
  }

  markAsTouched(): void {
    if (this.control && !this.hasBeenTouched) {
      this.hasBeenTouched = true;
      this.control.markAsTouched();
      this.updateErrorMessage();
    }
  }

  toggleDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      // MUDANÇA: Não marca como touched automaticamente ao fechar dropdown
      this.updateErrorMessage();
    }
  }

  selectOption(option: SelectOption, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    if (option.disabled || !this.control) return;

    // MUDANÇA: Marca como touched apenas quando uma opção é realmente selecionada
    // E apenas se não for a opção vazia (placeholder)
    const shouldMarkAsTouched = option.value !== '' && option.value !== null && option.value !== undefined;

    if (this.config.multiple) {
      const currentValue = this.control.value || [];
      const index = currentValue.indexOf(option.value);
      
      if (index > -1) {
        currentValue.splice(index, 1);
      } else {
        currentValue.push(option.value);
      }
      
      this.control.setValue([...currentValue]);
      if (shouldMarkAsTouched) {
        this.markAsTouched();
      }
    } else {
      this.control.setValue(option.value);
      if (shouldMarkAsTouched) {
        this.markAsTouched();
      }
      this.closeDropdown();
    }
    
    this.control.markAsDirty();
    this.updateErrorMessage();
  }

  isSelected(option: SelectOption): boolean {
    if (!this.control) return false;
    
    const value = this.control.value;
    
    if (this.config.multiple) {
      return Array.isArray(value) && value.includes(option.value);
    } else {
      return value === option.value;
    }
  }

  get hasValue(): boolean {
    if (!this.control) return false;
    
    const value = this.control.value;
    
    if (this.config.multiple) {
      return Array.isArray(value) && value.length > 0;
    } else {
      return value !== null && value !== undefined && value !== '';
    }
  }

  get isInvalid(): boolean {
    // MUDANÇA: Usa hasBeenTouched em vez de control.touched
    return this.control && this.control.invalid && (this.hasBeenTouched || this.control.dirty);
  }

  get displayValue(): string {
    if (this.selectedLabels) {
      return this.selectedLabels;
    }
    
    return this.config.placeholder || `Selecione ${this.config.label.toLowerCase()}`;
  }
}