// interfaces/rich-text-config.interface.ts
export interface RichTextConfig {
  type: 'rich-text';
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
  minHeight?: string;
  maxHeight?: string;
  
  // Propriedades adicionais que você estava usando
  formControlName?: string;
  label?: string;
  minLength?: number;
  maxLength?: number;
  toolbar?: 'basic' | 'full';
  theme?: 'snow' | 'bubble';
  height?: number;
  customErrorMessages?: {
    required?: string;
    minlength?: string;
    maxlength?: string;
    pattern?: string;
  };
}