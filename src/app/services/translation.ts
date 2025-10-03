import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  
  constructor(private translate: TranslateService) {
    // Idioma padrão
    this.translate.setDefaultLang('pt');
    
    // Tentar usar o idioma do navegador
    const browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang?.match(/pt|es|en/) ? browserLang : 'pt');
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang;
  }
}