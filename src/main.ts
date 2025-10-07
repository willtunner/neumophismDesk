import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Importações para locale pt-BR
import { registerLocaleData } from '@angular/common';
// ✅ Importações corretas para Angular 17+
import pt from '@angular/common/locales/pt';
import ptExtra from '@angular/common/locales/extra/pt';

// Registrar o locale pt-BR
registerLocaleData(pt, 'pt-BR', ptExtra);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));