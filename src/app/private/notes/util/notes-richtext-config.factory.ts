import { TranslateService } from '@ngx-translate/core';

export function buildRichTextConfig(translate: TranslateService): any {
  return {
    label: translate.instant('NOTES.FIELDS.CONTENT'),
    placeholder: translate.instant('NOTES.FIELDS.CONTENT_PLACEHOLDER'),
    required: true
  };
}