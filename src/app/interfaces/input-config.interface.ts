// input-config.interface.ts
import { ValidatorFn } from '@angular/forms';
import { InputType } from '../enuns/input-types.enum';

export interface InputConfig {
  // Configurações básicas
  type: InputType;
  formControlName: string;
  label: string;
  
  // Validações
  validators?: ValidatorFn[];
  customErrorMessages?: { [key: string]: string };
  
  // Configurações específicas
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  
  // Ícone
  iconName?: string; // Nome do ícone do Material
  customIcon?: string; // SVG customizado
  
  // Textarea específico
  rows?: number;
  
  // Número específico
  step?: number;

  // Select específico
  options?: SelectOption[];
}

export interface SelectConfig extends InputConfig {
  options: SelectOption[];
  multiple?: boolean;
  customIcon?: string;
  iconName?: string;
  emptyOptionLabel?: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}


