import { TranslateService } from '@ngx-translate/core';

export function buildInputConfigs(translate: TranslateService): any {
  return {
    titulo: {
      label: translate.instant('NOTES.TITLE'),
      placeholder: translate.instant('NOTES.TITLE_PLACEHOLDER'),
      type: 'text',
      required: true,
      maxLength: 100
    }
  };
}