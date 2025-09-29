// checkbox-config.interface.ts
import { ValidatorFn } from '@angular/forms';
import { CheckboxLayout, CheckboxSelection } from '../enuns/checkbox-types.enum';

export interface CheckboxOption {
  value: any;
  label: string;
  disabled?: boolean;
}

export interface CheckboxConfig {
  formControlName: string;
  options?: CheckboxOption[];
  layout?: CheckboxLayout;
  selection?: CheckboxSelection;
  required?: boolean;
  label?: string;
  customErrorMessages?: { [key: string]: string };
  validators?: ValidatorFn[];
}