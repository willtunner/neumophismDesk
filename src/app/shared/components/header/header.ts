import { Component, OnInit, OnDestroy, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GlobalMenuService } from '../../../services/global-menu';
import { Subscription, filter } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../../services/notification';
import { Notifications } from '../../../models/models';

interface Language {
  code: string;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit, OnDestroy {
  private menuSubscription!: Subscription;
  private routerSubscription!: Subscription;
  private translateSubscription!: Subscription;
  
  // Injetar o NotificationService
  private notificationService = inject(NotificationService);
  
  isMenuOpen = false;
  currentRouteTitle = 'Home';
  selectedLanguage = 'pt';
  showMessages = false;
  showNotifications = false;

  languages: Language[] = [
    { code: 'pt', name: 'Português', flag: 'assets/images/brazil-flag.png' },
    { code: 'es', name: 'Español', flag: 'assets/images/spain-flag.png' },
    { code: 'en', name: 'English', flag: 'assets/images/usa-flag.png' }
  ];

  // Usando computed signals para as notificações
  messages = this.notificationService.messageNotifications;
  notifications = this.notificationService.notifications;

  constructor(
    private globalMenuService: GlobalMenuService,
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.menuSubscription = this.globalMenuService.isMenuOpen$.subscribe(
      isOpen => {
        this.isMenuOpen = isOpen;
      }
    );

    // Escuta mudanças de rota
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateRouteTitle();
      });

    // Escuta mudanças de idioma
    this.translateSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateRouteTitle();
    });

    // Carrega as notificações iniciais
    this.loadAllNotifications();

    // Atualiza o título inicial
    this.updateRouteTitle();
  }

  /**
   * Carrega todas as notificações do serviço
   */
  async loadAllNotifications() {
    try {
      console.log('📢 Iniciando carregamento de notificações...');
      
      await this.notificationService.loadAllUserNotifications();
      
      console.log('✅ Notificações carregadas via signals');
      console.log('📨 Mensagens:', this.messages());
      console.log('🔔 Notificações do sistema:', this.notifications());
      
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error);
    }
  }

  toggleDropdown(type: 'messages' | 'notifications') {
    if (type === 'messages') {
      this.showMessages = !this.showMessages;
      this.showNotifications = false;
      
      // Quando abrir o dropdown de mensagens, marca como lidas
      // if (this.showMessages && this.getUnreadMessagesCount() > 0) {
      //   this.markAllMessagesAsRead();
      // }
    } else {
      this.showNotifications = !this.showNotifications;
      this.showMessages = false;
      
      // Quando abrir o dropdown de notificações, marca como lidas
      if (this.showNotifications && this.getUnreadNotificationsCount() > 0) {
        this.markAllNotificationsAsRead();
      }
    }
  }

  closeAllDropdowns() {
    this.showMessages = false;
    this.showNotifications = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container') && 
        !target.closest('.dropdown-panel')) {
      this.closeAllDropdowns();
    }
  }

  getUnreadMessagesCount(): number {
    return this.notificationService.getUnreadCount(true);
  }

  getUnreadNotificationsCount(): number {
    return this.notificationService.getUnreadCount(false);
  }

  /**
   * Marca todas as mensagens como lidas
   */
  async markAllMessagesAsRead() {
    try {
      await this.notificationService.markAllAsRead(true);
      console.log('✅ Todas as mensagens marcadas como lidas');
    } catch (error) {
      console.error('❌ Erro ao marcar mensagens como lidas:', error);
    }
  }

  /**
   * Marca todas as notificações como lidas
   */
  async markAllNotificationsAsRead() {
    // try {
    //   await this.notificationService.markAllAsRead(false);
    //   console.log('✅ Todas as notificações marcadas como lidas');
    // } catch (error) {
    //   console.error('❌ Erro ao marcar notificações como lidas:', error);
    // }
  }

  /**
   * Marca uma notificação específica como lida
   */
  async markAsRead(notificationId: string, isMessage: boolean = false) {
    try {
      await this.notificationService.markAsRead(notificationId);
      console.log(`✅ Notificação ${notificationId} marcada como lida`);
    } catch (error) {
      console.error('❌ Erro ao marcar notificação como lida:', error);
    }
  }

  getNotificationType(iconType: string): string {
    // Mapeia os tipos do Firestore para as classes CSS
    const typeMap: { [key: string]: string } = {
      'SUCCESS': 'success',
      'INFO': 'info',
      'WARNING': 'warning',
      'ERROR': 'error',
      'MESSAGE': 'message'
    };
    return typeMap[iconType] || 'info';
  }

  openAllMessages() {
    console.log('Abrir todas as mensagens');
    this.showMessages = false;
    // Navegar para página de mensagens
    // this.router.navigate(['/messages']);
  }

  openAllNotifications() {
    console.log('Abrir todas as notificações');
    this.showNotifications = false;
    // Navegar para página de notificações
    // this.router.navigate(['/notifications']);
  }

  /**
   * Formata a data para exibição no template
   */
  formatTime(date: Date): string {
    if (!date) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    
    return date.toLocaleDateString('pt-BR');
  }

  updateRouteTitle() {
    const url = this.router.url;
    const routeName = url.split('/')[1] || 'home';
    
    // Mapeia os nomes das rotas para as chaves de tradução
    const routeTranslationKeys: { [key: string]: string } = {
      'home': 'HEADER.HOME',
      'profile': 'HEADER.PROFILE',
      'settings': 'HEADER.SETTINGS',
      'dashboard': 'HEADER.DASHBOARD',
      'users': 'HEADER.USERS',
      'products': 'HEADER.PRODUCTS',
      'reports': 'HEADER.REPORTS',
      'help': 'HEADER.HELP',
      'chat': 'HEADER.CHAT',
      'clients': 'HEADER.CLIENTS',
      'companies': 'HEADER.COMPANIES',
      'calendar': 'HEADER.CALENDAR',
      'tutorials': 'HEADER.TUTORIALS',
      'call': 'HEADER.CALL'
    };

    const translationKey = routeTranslationKeys[routeName];
    
    if (translationKey) {
      // Usa a tradução se a chave existir
      this.translate.get(translationKey).subscribe((translatedTitle: string) => {
        this.currentRouteTitle = translatedTitle;
      });
    } else {
      // Fallback para formatação do nome da rota
      this.currentRouteTitle = this.formatRouteName(routeName);
    }
  }

  formatRouteName(routeName: string): string {
    return routeName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getSelectedFlag(): string {
    const selectedLang = this.languages.find(lang => lang.code === this.selectedLanguage);
    return selectedLang ? selectedLang.flag : this.languages[0].flag;
  }

  changeLanguage(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      const lang = target.value;
      this.selectedLanguage = lang;
      this.translate.use(lang);
      console.log('Idioma alterado para:', lang);
      
      // Atualiza o título da rota quando o idioma muda
      this.updateRouteTitle();
    }
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
    if (this.translateSubscription) {
      this.translateSubscription.unsubscribe();
    }
  }
}