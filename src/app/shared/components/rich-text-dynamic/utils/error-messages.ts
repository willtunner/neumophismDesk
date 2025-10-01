import { RichTextConfig } from '../../../../interfaces/rich-text-config.interface';

export function getErrorMessage(
    errors: any,
    config: RichTextConfig,
    limit: number,
    count: number
  ): string {
    const key = Object.keys(errors)[0];
    const val = errors[key];
  
    const custom = config?.customErrorMessages;
  
    // correção TypeScript
    if (custom && key in custom && custom[key as keyof typeof custom]) {
      return custom[key as keyof typeof custom]!;
    }
  
    switch (key) {
      case 'required': return 'Campo obrigatório';
      case 'minlength': return `Mínimo de ${val.requiredLength} caracteres (${val.actualLength} digitados)`;
      case 'maxlength': return `Máximo de ${val.requiredLength} caracteres (${val.actualLength} digitados)`;
      case 'limitExceeded': return `Limite excedido em ${count - limit} caracteres`;
      default: return 'Valor inválido';
    }
  }
  
