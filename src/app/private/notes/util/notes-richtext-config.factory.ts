import { TranslateService } from '@ngx-translate/core';

export function buildRichTextConfig(translate: TranslateService): any {
  return {
    label: translate.instant('NOTES.CONTENT'),
    placeholder: translate.instant('NOTES.CONTENT_PLACEHOLDER'),
    required: true
  };
}