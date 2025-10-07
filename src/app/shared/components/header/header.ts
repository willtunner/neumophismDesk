import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GlobalMenuService } from '../../../services/global-menu';
import { Subscription, filter } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface Message {
  id: number;
  sender: string;
  preview: string;
  time: string;
  read: boolean;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
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

  // JSON de Mensagens (3 mensagens)
  messages: Message[] = [
    { 
      id: 1, 
      sender: 'João Silva', 
      preview: 'Olá, poderia enviar o relatório do projeto até amanhã? Preciso apresentar para a diretoria.', 
      time: '5m atrás',
      read: false
    },
    { 
      id: 2, 
      sender: 'Maria Oliveira', 
      preview: 'Reunião foi reagendada para sexta-feira às 14h. Confirmar presença.', 
      time: '25m atrás',
      read: false
    },
    { 
      id: 3, 
      sender: 'Lucas Andrade', 
      preview: 'A proposta que enviamos foi aprovada! Vamos precisar agendar uma reunião para os próximos passos.', 
      time: '1h atrás',
      read: true
    }
  ];

  // JSON de Notificações (7 notificações)
  notifications: Notification[] = [
    { 
      id: 1, 
      title: 'Novo pedido recebido', 
      message: 'Você recebeu um novo pedido de orçamento do cliente XYZ Corporation.', 
      time: '2m atrás',
      type: 'info',
      read: false
    },
    { 
      id: 2, 
      title: 'Projeto aprovado', 
      message: 'Parabéns! Seu projeto "Sistema de Gestão" foi aprovado pela comissão.', 
      time: '15m atrás',
      type: 'success',
      read: true
    },
    { 
      id: 3, 
      title: 'Lembrete de reunião', 
      message: 'Reunião de equipe amanhã às 10h na sala de conferências.', 
      time: '1h atrás',
      type: 'warning',
      read: false
    },
    { 
      id: 4, 
      title: 'Pagamento confirmado', 
      message: 'Fatura referente ao mês de março foi paga e confirmada.', 
      time: '2h atrás',
      type: 'success',
      read: true
    },
    { 
      id: 5, 
      title: 'Novo membro na equipe', 
      message: 'Carlos Santos foi adicionado ao projeto "Desenvolvimento Web".', 
      time: '3h atrás',
      type: 'info',
      read: false
    },
    { 
      id: 6, 
      title: 'Prazo se aproximando', 
      message: 'Entrega da fase 2 do projeto em 3 dias. Verifique o progresso.', 
      time: 'Ontem',
      type: 'warning',
      read: false
    },
    { 
      id: 7, 
      title: 'Atualização de segurança', 
      message: 'Nova atualização de segurança foi aplicada no sistema principal.', 
      time: '2 dias atrás',
      type: 'info',
      read: false
    }
  ];

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

    // Atualiza o título inicial
    this.updateRouteTitle();
  }

  toggleDropdown(type: 'messages' | 'notifications') {
    if (type === 'messages') {
      this.showMessages = !this.showMessages;
      this.showNotifications = false;
    } else {
      this.showNotifications = !this.showNotifications;
      this.showMessages = false;
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
    return this.messages.filter(message => !message.read).length;
  }

  getUnreadNotificationsCount(): number {
    return this.notifications.filter(notification => !notification.read).length;
  }

  markAllMessagesAsRead() {
    this.messages.forEach(message => message.read = true);
  }

  markAllNotificationsAsRead() {
    this.notifications.forEach(notification => notification.read = true);
  }

  getNotificationType(type: string): string {
    return type; // Já vem formatado do JSON
  }

  openAllMessages() {
    console.log('Abrir todas as mensagens');
    this.showMessages = false;
    // Navegar para página de mensagens
  }

  openAllNotifications() {
    console.log('Abrir todas as notificações');
    this.showNotifications = false;
    // Navegar para página de notificações
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