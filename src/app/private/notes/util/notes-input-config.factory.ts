import { TranslateService } from '@ngx-translate/core';

export function buildInputConfigs(translate: TranslateService): any {
  return {
    titulo: {
      label: translate.instant('NOTES.FIELDS.TITLE'),
      placeholder: translate.instant('NOTES.FIELDS.TITLE_PLACEHOLDER'),
      type: 'text',
      required: true
    }
  };
}