import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GlobalMenuService } from '../../../services/global-menu';
import { Subscription, filter } from 'rxjs';

interface Language {
  code: string;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit, OnDestroy {
  private menuSubscription!: Subscription;
  private routerSubscription!: Subscription;
  
  isMenuOpen = false;
  currentRouteTitle = 'Home';
  selectedLanguage = 'pt';
  unreadMessages = 3;
  unreadNotifications = 7;

  languages: Language[] = [
    { code: 'pt', name: 'Português', flag: 'assets/images/brazil-flag.png' },
    { code: 'es', name: 'Español', flag: 'assets/images/spain-flag.png' },
    { code: 'en', name: 'English', flag: 'assets/images/usa-flag.png' }
  ];

  constructor(
    private globalMenuService: GlobalMenuService,
    private router: Router
  ) { }

  ngOnInit() {
    // Escuta as mudanças do menu
    this.menuSubscription = this.globalMenuService.isMenuOpen$.subscribe(
      isOpen => {
        this.isMenuOpen = isOpen;
      }
    );

    // Escuta as mudanças de rota para atualizar o título
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateRouteTitle();
      });

    // Atualiza o título inicial
    this.updateRouteTitle();
  }

  updateRouteTitle() {
    const url = this.router.url;
    const routeName = url.split('/')[1] || 'home';
    
    // Mapeia os nomes das rotas para títulos amigáveis
    const routeTitles: { [key: string]: string } = {
      'home': 'Home',
      'profile': 'Perfil',
      'settings': 'Configurações',
      'dashboard': 'Dashboard',
      'users': 'Usuários',
      'products': 'Produtos',
      'reports': 'Relatórios',
      'help': 'Ajuda'
    };

    this.currentRouteTitle = routeTitles[routeName] || this.formatRouteName(routeName);
  }

  formatRouteName(routeName: string): string {
    // Converte "minha-rota" para "Minha Rota"
    return routeName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getSelectedFlag(): string {
    const selectedLang = this.languages.find(lang => lang.code === this.selectedLanguage);
    return selectedLang ? selectedLang.flag : this.languages[0].flag;
  }

  onLanguageChange() {
    console.log('Idioma alterado para:', this.selectedLanguage);
    // Aqui você pode implementar a lógica de internacionalização
    // Por exemplo, usando ngx-translate ou similar
  }

  openMessages() {
    console.log('Abrir mensagens');
    this.unreadMessages = 0; // Marcar como lidas (exemplo)
    // Implementar a lógica para abrir o painel de mensagens
  }

  openNotifications() {
    console.log('Abrir notificações');
    this.unreadNotifications = 0; // Marcar como lidas (exemplo)
    // Implementar a lógica para abrir o painel de notificações
  }

  toggleGlobalMenu() {
    this.globalMenuService.toggleMenu();
  }

  ngOnDestroy() {
    if (this.menuSubscription) {
      this.menuSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}