import { TranslateService } from '@ngx-translate/core';

export function t(translate: TranslateService, key: string): string {
  return translate.instant(key);
}

export function tParams(translate: TranslateService, key: string, params: any): string {
  return translate.instant(key, params);
}
