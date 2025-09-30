export interface RichTextConfig {
  formControlName: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  customErrorMessages?: { [key: string]: string };
  toolbar?: 'full' | 'basic' | 'minimal' | any[];
  theme?: 'snow' | 'bubble';
  height?: number;
  // Remover formats ou usar apenas os válidos
  formats?: string[]; // Opcional - se usar, apenas formats válidos
}