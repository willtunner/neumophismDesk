// input-validators.service.ts
import { Injectable } from '@angular/core';
import { Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { InputType } from '../enuns/input-types.enum';

@Injectable({
  providedIn: 'root'
})
export class InputValidatorsService {
  
  private readonly EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private readonly CPF_PATTERN = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  private readonly CNPJ_PATTERN = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
  private readonly CEP_PATTERN = /^\d{5}-\d{3}$/;

  getDefaultValidators(type: InputType, config: any): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    // Validação required padrão
    if (config.required !== false) {
      validators.push(Validators.required);
    }

    // Validações específicas por tipo
    switch (type) {
      case InputType.EMAIL:
        validators.push(Validators.pattern(this.EMAIL_PATTERN));
        break;
        
      case InputType.CPF:
        validators.push(Validators.pattern(this.CPF_PATTERN));
        break;
        
      case InputType.CNPJ:
        validators.push(Validators.pattern(this.CNPJ_PATTERN));
        break;
        
      case InputType.CEP:
        validators.push(Validators.pattern(this.CEP_PATTERN));
        break;
        
      case InputType.TEXT:
      case InputType.USER:
        if (config.minLength) {
          validators.push(Validators.minLength(config.minLength));
        }
        if (config.maxLength) {
          validators.push(Validators.maxLength(config.maxLength));
        }
        break;
        
      case InputType.NUMBER:
        if (config.min !== undefined) {
          validators.push(Validators.min(config.min));
        }
        if (config.max !== undefined) {
          validators.push(Validators.max(config.max));
        }
        break;
    }

    // Pattern customizado
    if (config.pattern) {
      validators.push(Validators.pattern(config.pattern));
    }

    return validators;
  }

  getDefaultErrorMessage(errorKey: string, errorValue: any, config: any): string {
    switch (errorKey) {
      case 'required':
        return `${config.label} é obrigatório`;
        
      case 'minlength':
        return `${config.label} deve ter no mínimo ${errorValue.requiredLength} caracteres`;
        
      case 'maxlength':
        return `${config.label} deve ter no máximo ${errorValue.requiredLength} caracteres`;
        
      case 'min':
        return `${config.label} deve ser no mínimo ${errorValue.min}`;
        
      case 'max':
        return `${config.label} deve ser no máximo ${errorValue.max}`;
        
      case 'pattern':
        return this.getPatternErrorMessage(config.type);
        
      default:
        return `Erro no campo ${config.label}`;
    }
  }

  private getPatternErrorMessage(type: InputType): string {
    switch (type) {
      case InputType.EMAIL:
        return 'Email inválido';
      case InputType.CPF:
        return 'CPF inválido (formato: 000.000.000-00)';
      case InputType.CNPJ:
        return 'CNPJ inválido (formato: 00.000.000/0000-00)';
      case InputType.CEP:
        return 'CEP inválido (formato: 00000-000)';
      default:
        return 'Formato inválido';
    }
  }
}