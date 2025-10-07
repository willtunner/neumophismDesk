export interface SelectConfig {
    formControlName: string;
    label: string;
    required?: boolean;
    placeholder?: string;
    options: SelectOption[];
    multiple?: boolean;
    customErrorMessages?: { [key: string]: string };
    iconName?: string;
    customIcon?: string;
  }
  
  export interface SelectOption {
    value: any;
    label: string;
    disabled?: boolean;
  }