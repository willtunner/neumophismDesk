import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';
import { RichTextConfig } from '../../../../interfaces/rich-text-config.interface';
import { stripHtml } from './html-utils';

export function buildValidators(config: RichTextConfig, limit: number): ValidatorFn[] {
  const validators: ValidatorFn[] = [];

  if (config?.required) validators.push(requiredValidator());
  if (config?.minLength) validators.push(minLengthValidator(config.minLength));
  if (config?.maxLength) validators.push(maxLengthValidator(config.maxLength));
  if (limit > 0) validators.push(limitValidator(limit));

  return validators;
}

export function requiredValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    const text = stripHtml(control.value);
    return text.trim().length > 0 ? null : { required: true };
  };
}

export function minLengthValidator(min: number): ValidatorFn {
  return (control: AbstractControl) => {
    const text = stripHtml(control.value);
    return text.length < min ? { minlength: { requiredLength: min, actualLength: text.length } } : null;
  };
}

export function maxLengthValidator(max: number): ValidatorFn {
  return (control: AbstractControl) => {
    const text = stripHtml(control.value);
    return text.length > max ? { maxlength: { requiredLength: max, actualLength: text.length } } : null;
  };
}

export function limitValidator(limit: number): ValidatorFn {
  return (control: AbstractControl) => {
    const text = stripHtml(control.value);
    return text.length > limit ? { limitExceeded: true } : null;
  };
}
