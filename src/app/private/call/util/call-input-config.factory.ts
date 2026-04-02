import { TranslateService } from '@ngx-translate/core';
import { InputConfig } from '../../../interfaces/input-config.interface';
import { InputType } from '../../../enuns/input-types.enum';
import { t, tParams } from './call-translation.util';

export function buildInputConfigs(translate: TranslateService): Record<string, InputConfig> {
  return {
    conexao: {
      type: InputType.CONNECTION,
      formControlName: 'connection',
      label: t(translate, 'INPUTS_FIELDS.CONECTION'),
      required: true,
      minLength: 5,
      maxLength: 15,
      placeholder: t(translate, 'INPUTS_FIELDS.PLACEHOLDER_CONECTION'),
      customErrorMessages: {
        required: t(translate, 'VALIDATOR_ERROR_MESSAGES.REQUIRED'),
        minlength: tParams(translate, 'VALIDATOR_ERROR_MESSAGES.MINLENGTH', { requiredLength: 5 }),
        maxlength: tParams(translate, 'VALIDATOR_ERROR_MESSAGES.MAXLENGTH', { requiredLength: 15 }),
      },
    },
    titulo: {
      type: InputType.TITLE,
      formControlName: 'title',
      label: t(translate, 'INPUTS_FIELDS.TITLE'),
      required: true,
      placeholder: t(translate, 'INPUTS_FIELDS.PLACEHOLDER_TITLE'),
      minLength: 50,
      maxLength: 70,
      customErrorMessages: {
        required: t(translate, 'VALIDATOR_ERROR_MESSAGES.REQUIRED'),
        minlength: tParams(translate, 'VALIDATOR_ERROR_MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: tParams(translate, 'VALIDATOR_ERROR_MESSAGES.MAXLENGTH', { requiredLength: 100 }),
      },
    },
    descricao: {
      type: InputType.TEXTAREA,
      formControlName: 'description',
      label: t(translate, 'INPUTS_FIELDS.DESCRIPTION'),
      required: true,
      placeholder: t(translate, 'INPUTS_FIELDS.PLACEHOLDER_DESCRIPTION'),
      rows: 4,
      minLength: 10,
      maxLength: 500,
      customErrorMessages: {
        required: t(translate, 'VALIDATOR_ERROR_MESSAGES.REQUIRED'),
        minlength: tParams(translate, 'VALIDATOR_ERROR_MESSAGES.MINLENGTH', { requiredLength: 10 }),
        maxlength: tParams(translate, 'VALIDATOR_ERROR_MESSAGES.MAXLENGTH', { requiredLength: 500 }),
      },
    },
  };
}
