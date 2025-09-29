// input-dynamic.component.ts
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators, AbstractControl } from '@angular/forms';
import { InputConfig } from '../../../interfaces/input-config.interface';
import { InputType } from '../../../enuns/input-types.enum';
import { InputValidatorsService } from '../../../services/input-validators';

@Component({
  selector: 'app-input-dynamic',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input-dynamic.html',
  styleUrls: ['./input-dynamic.css']
})
export class InputDynamicComponent implements OnInit {
  @Input() config!: InputConfig;
  @Input() control!: FormControl;
  @Output() valueChange = new EventEmitter<any>();

  inputType: string = 'text';
  errorMessage: string = '';
  isFocused: boolean = false;

  // Ícones SVG para cada tipo - CORRIGIDO com TEXTAREA
  private readonly icons: { [key in InputType]: string } = {
    [InputType.USER]: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    `,
    [InputType.EMAIL]: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    `,
    [InputType.TEXT]: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10,9 9,9 8,9"/>
      </svg>
    `,
    [InputType.NUMBER]: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    `,
    [InputType.CEP]: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9v-9m0-9v9"/>
      </svg>
    `,
    [InputType.CPF]: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    `,
    [InputType.CNPJ]: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
      </svg>
    `,
    [InputType.TEXTAREA]: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10,9 9,9 8,9"/>
      </svg>
    `
  };

  constructor(private validatorsService: InputValidatorsService) {}

  ngOnInit(): void {
    this.setupInputType();
    this.setupValidators();
    this.setupValueChanges();
  }

  private setupInputType(): void {
    switch (this.config.type) {
      case InputType.EMAIL:
        this.inputType = 'email';
        break;
      case InputType.NUMBER:
        this.inputType = 'number';
        break;
      case InputType.TEXTAREA:
        this.inputType = 'textarea';
        break;
      default:
        this.inputType = 'text';
    }
  }

  private setupValidators(): void {
    if (!this.control) {
      console.warn('FormControl não fornecido para o input dinâmico');
      return;
    }
  
    // Usa o serviço para obter as validações padrão
    const defaultValidators = this.validatorsService.getDefaultValidators(this.config.type, this.config);
    const customValidators = this.config.validators || [];
    
    const allValidators = [...defaultValidators, ...customValidators];
    
    this.control.setValidators(allValidators);
    this.control.updateValueAndValidity();
  }

  private setupValueChanges(): void {
    this.control.valueChanges.subscribe(value => {
      this.valueChange.emit(value);
      this.updateErrorMessage();
    });

    this.control.statusChanges.subscribe(() => {
      this.updateErrorMessage();
    });
  }

  private updateErrorMessage(): void {
    if (this.control.invalid && this.control.touched) {
      const errors = this.control.errors;
      if (errors) {
        const firstErrorKey = Object.keys(errors)[0];
        const errorValue = errors[firstErrorKey];
        
        // Verifica se há mensagem customizada
        if (this.config.customErrorMessages && this.config.customErrorMessages[firstErrorKey]) {
          this.errorMessage = this.config.customErrorMessages[firstErrorKey];
        } else {
          this.errorMessage = this.validatorsService.getDefaultErrorMessage(
            firstErrorKey, 
            errorValue, 
            this.config
          );
        }
      }
    } else {
      this.errorMessage = '';
    }
  }

  getIconSvg(): string {
    // Retorna ícone customizado se fornecido
    if (this.config.customIcon) {
      return this.config.customIcon;
    }
    
    // Retorna ícone por nome do Material se fornecido
    if (this.config.iconName) {
      return this.getMaterialIcon(this.config.iconName);
    }
    
    // Retorna ícone padrão baseado no tipo - CORRIGIDO
    return this.icons[this.config.type] || this.icons[InputType.TEXT];
  }

  private getMaterialIcon(iconName: string): string {
    // Aqui você pode mapear nomes de ícones do Material para SVGs
    // Por enquanto, retornamos um ícone genérico
    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <text x="12" y="16" text-anchor="middle" font-size="10" fill="currentColor">${iconName.charAt(0)}</text>
      </svg>
    `;
  }

  onFocus(): void {
    this.isFocused = true;
  }

  onBlur(): void {
    this.isFocused = false;
    this.control.markAsTouched();
    this.updateErrorMessage();
  }

  get isTextarea(): boolean {
    return this.config.type === InputType.TEXTAREA;
  }

  get hasValue(): boolean {
    return this.control.value && this.control.value.toString().trim().length > 0;
  }

  get isInvalid(): boolean {
    return this.control.invalid && this.control.touched;
  }
}