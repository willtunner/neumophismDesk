// rich-text-config.interface.ts
export interface RichTextConfig {
  type: 'rich-text';
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
  minHeight?: string;
  maxHeight?: string;
  
  // Novas propriedades para validação
  formControlName?: string;
  label?: string;
  minLength?: number;
  maxLength?: number;
  customErrorMessages?: {
    required?: string;
    minlength?: string;
    maxlength?: string;
  };
}