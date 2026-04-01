import { TranslateService } from '@ngx-translate/core';
import { RichTextConfig } from '../../../interfaces/rich-text-config.interface';
import { t, tParams } from './call-translation.util';

export function buildRichTextConfig(translate: TranslateService): RichTextConfig {
  return {
    formControlName: 'conteudo',
    type: 'rich-text',
    label: t(translate, 'INPUTS-FIELS.CONTENT'),
    required: true,
    placeholder: t(translate, 'INPUTS-FIELS.PLACEHOLDER_CONTENT'),
    minLength: 20,
    maxLength: 5000,
    minHeight: '200px',
    customErrorMessages: {
      required: t(translate, 'VALIDATOR_ERROR_MESSAGES.REQUIRED'),
      minlength: tParams(translate, 'VALIDATOR_ERROR_MESSAGES.MINLENGTH', { requiredLength: 20 }),
      maxlength: tParams(translate, 'VALIDATOR_ERROR_MESSAGES.MAXLENGTH', { requiredLength: 5000 }),
    },
  };
}
