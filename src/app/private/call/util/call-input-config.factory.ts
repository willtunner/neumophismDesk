import { TranslateService } from '@ngx-translate/core';
import { InputConfig } from '../../../interfaces/input-config.interface';
import { InputType } from '../../../enuns/input-types.enum';
import { t, tParams } from './call-translation.util';

export function buildInputConfigs(translate: TranslateService): Record<string, InputConfig> {
  return {
    conexao: {
      type: InputType.TEXT,
      formControlName: 'connection',
      label: t(translate, 'INPUTS-FIELS.CONECTION'),
      required: false,
      placeholder: t(translate, 'INPUTS-FIELS.NUMBER_CONECTION_PLACEHOLDER'),
      iconName: 'link',
    },
    titulo: {
      type: InputType.TEXT,
      formControlName: 'title',
      label: t(translate, 'INPUTS-FIELS.TITLE'),
      required: true,
      placeholder: t(translate, 'INPUTS-FIELS.PLACEHOLDER_TITLE'),
      iconName: 'title',
      minLength: 2,
      maxLength: 100,
      customErrorMessages: {
        required: t(translate, 'VALIDATOR-ERROR-MESSAGES.REQUIRED'),
        minlength: tParams(translate, 'VALIDATOR-ERROR-MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: tParams(translate, 'VALIDATOR-ERROR-MESSAGES.MAXLENGTH', { requiredLength: 100 }),
      },
    },
    descricao: {
      type: InputType.TEXTAREA,
      formControlName: 'description',
      label: t(translate, 'INPUTS-FIELS.DESCRIPTION'),
      required: true,
      placeholder: t(translate, 'INPUTS-FIELS.PLACEHOLDER_DESCRIPTION'),
      rows: 4,
      minLength: 10,
      maxLength: 500,
      iconName: 'description',
      customErrorMessages: {
        required: t(translate, 'VALIDATOR-ERROR-MESSAGES.REQUIRED'),
        minlength: tParams(translate, 'VALIDATOR-ERROR-MESSAGES.MINLENGTH', { requiredLength: 10 }),
        maxlength: tParams(translate, 'VALIDATOR-ERROR-MESSAGES.MAXLENGTH', { requiredLength: 500 }),
      },
    },
  };
}
