import { inject, Injectable, signal } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  CollectionReference,
  orderBy,
  updateDoc,
  doc,
  onSnapshot,
  Unsubscribe
} from '@angular/fire/firestore';
import { SessionService } from './session.service';
import { Notifications, User } from '../models/models';
import { NotificationType } from '../enuns/notification-icon-types.enum';
import { addDoc, getDoc } from 'firebase/firestore';

const PATH_NOTIFICATIONS = 'notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private _firestore = inject(Firestore);
  private _sessionService = inject(SessionService);
  private _unsubscribe: Unsubscribe | null = null;
  userLogged!: User;

  // Signal para as notificações
  notifications = signal<Notifications[]>([]);
  messageNotifications = signal<Notifications[]>([]);

  constructor() {
    // Inicializa o listener quando o serviço é criado
    this.initializeNotificationsListener();
  }

  // Getter lazy para a coleção de notificações
  private get _notificationsCollection(): CollectionReference {
    return collection(this._firestore, PATH_NOTIFICATIONS);
  }

  /**
   * Inicializa o listener em tempo real para notificações
   */
  private initializeNotificationsListener(): void {
    const session = this._sessionService.getSession();
    if (!session) {
      console.log('❌ Usuário não está logado - listener não iniciado');
      return;
    }

    this.userLogged = session;

    // Para evitar múltiplos listeners
    if (this._unsubscribe) {
      this._unsubscribe();
    }

    try {
      // Query simplificada sem orderBy para evitar necessidade de índice
      const notificationsQuery = query(
        this._notificationsCollection,
        where('helpDeskId', '==', this.userLogged.helpDeskCompanyId)
      );

      // Listener em tempo real
      this._unsubscribe = onSnapshot(notificationsQuery, 
        (querySnapshot) => {
          console.log('📢 Atualização em tempo real das notificações');
          
          const allNotifications = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return this.mapToNotification(doc.id, data);
          });

          // Ordena localmente por data de criação (mais recente primeiro)
          const sortedNotifications = allNotifications.sort((a, b) => 
            new Date(b.created!).getTime() - new Date(a.created!).getTime()
          );

          // Filtra as notificações para o usuário atual
          this.filterAndUpdateNotifications(sortedNotifications);
        },
        (error) => {
          console.error('❌ Erro no listener de notificações:', error);
          // Tenta uma abordagem alternativa se houver erro de índice
          this.fallbackLoadNotifications();
        }
      );
    } catch (error) {
      console.error('❌ Erro ao inicializar listener:', error);
      this.fallbackLoadNotifications();
    }
  }

  /**
   * Carregamento alternativo sem usar queries complexas
   */
  private async fallbackLoadNotifications(): Promise<void> {
    try {
      console.log('🔄 Usando carregamento alternativo de notificações...');
      
      const currentUser = this._sessionService.getSession();
      if (!currentUser) return;

      // Busca todas as notificações e filtra localmente
      const querySnapshot = await getDocs(this._notificationsCollection);
      
      const allNotifications = querySnapshot.docs
        .map(doc => this.mapToNotification(doc.id, doc.data()))
        .filter(notification => 
          notification.helpDeskId === currentUser.helpDeskCompanyId &&
          (!notification.userId || notification.userId === currentUser.id)
        )
        .sort((a, b) => new Date(b.created!).getTime() - new Date(a.created!).getTime());

      this.filterAndUpdateNotifications(allNotifications);
      
    } catch (error) {
      console.error('❌ Erro no carregamento alternativo:', error);
    }
  }

  /**
   * Mapeia os dados do Firestore para o modelo Notifications
   */
  private mapToNotification(id: string, data: any): Notifications {
    return {
      id,
      title: data['title'],
      content: data['content'],
      created: data['created']?.toDate(),
      iconType: data['iconType'],
      isRead: data['isRead'] || false,
      isMessageNotification: data['isMessageNotification'] || false,
      userId: data['userId'],
      helpDeskId: data['helpDeskId'],
      path: data['path']
    };
  }

  /**
   * Filtra as notificações e atualiza os signals
   */
  private filterAndUpdateNotifications(allNotifications: Notifications[]): void {
    const currentUser = this.userLogged;

    // Filtra notificações: se tem userId, deve ser igual ao usuário logado
    const userNotifications = allNotifications.filter(notification => 
      !notification.userId || notification.userId === currentUser.id
    );

    // Separa em notificações de sistema e mensagens
    const systemNotifications = userNotifications.filter(n => !n.isMessageNotification);
    const messageNotifications = userNotifications.filter(n => n.isMessageNotification);

    // Atualiza os signals
    this.notifications.set(systemNotifications);
    this.messageNotifications.set(messageNotifications);

    console.log(`✅ Notificações atualizadas - Sistema: ${systemNotifications.length}, Mensagens: ${messageNotifications.length}`);
  }

  /**
   * Busca notificações baseado no tipo (mensagens ou sistema)
   * @param isMessageNotification true para notificações de mensagens, false para sistema
   */
  async loadNotifications(isMessageNotification: boolean): Promise<Notifications[]> {
    try {
      console.log(`📢 Carregando notificações: ${isMessageNotification ? 'MENSAGENS' : 'SISTEMA'}`);
      
      const currentUser = this._sessionService.getSession();
      if (!currentUser) {
        console.log('❌ Usuário não está logado');
        return [];
      }

      try {
        // Tenta a query com índice primeiro
        let notificationsQuery = query(
          this._notificationsCollection,
          where('helpDeskId', '==', currentUser.helpDeskCompanyId),
          where('isMessageNotification', '==', isMessageNotification)
        );

        const querySnapshot = await getDocs(notificationsQuery);
        
        const filteredNotifications = querySnapshot.docs
          .map(doc => this.mapToNotification(doc.id, doc.data()))
          .filter(notification => 
            !notification.userId || notification.userId === currentUser.id
          );

        console.log(`✅ ${isMessageNotification ? 'Notificações de mensagens' : 'Notificações do sistema'} carregadas:`, filteredNotifications);

        // Atualiza os signals correspondentes
        if (isMessageNotification) {
          this.messageNotifications.set(filteredNotifications);
        } else {
          this.notifications.set(filteredNotifications);
        }

        return filteredNotifications;

      } catch (indexError) {
        console.warn('⚠️ Índice não encontrado, usando filtro local...');
        
        // Fallback: busca todas e filtra localmente
        const querySnapshot = await getDocs(this._notificationsCollection);
        
        const filteredNotifications = querySnapshot.docs
          .map(doc => this.mapToNotification(doc.id, doc.data()))
          .filter(notification => 
            notification.helpDeskId === currentUser.helpDeskCompanyId &&
            notification.isMessageNotification === isMessageNotification &&
            (!notification.userId || notification.userId === currentUser.id)
          )
          .sort((a, b) => new Date(b.created!).getTime() - new Date(a.created!).getTime());

        console.log(`✅ ${isMessageNotification ? 'Notificações de mensagens' : 'Notificações do sistema'} (fallback):`, filteredNotifications);

        // Atualiza os signals correspondentes
        if (isMessageNotification) {
          this.messageNotifications.set(filteredNotifications);
        } else {
          this.notifications.set(filteredNotifications);
        }

        return filteredNotifications;
      }

    } catch (error) {
      console.error(`❌ Erro ao carregar notificações (${isMessageNotification ? 'mensagens' : 'sistema'}):`, error);
      return [];
    }
  }

  /**
   * Busca todas as notificações do usuário logado
   */
  async loadAllUserNotifications(): Promise<{ system: Notifications[], messages: Notifications[] }> {
    try {
      const [systemNotifications, messageNotifications] = await Promise.all([
        this.loadNotifications(false),
        this.loadNotifications(true)
      ]);

      return {
        system: systemNotifications,
        messages: messageNotifications
      };

    } catch (error) {
      console.error('❌ Erro ao carregar todas as notificações:', error);
      return { system: [], messages: [] };
    }
  }

  /**
   * Marca uma notificação como lida (atualiza no Firestore e no Signal)
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      console.log(`📢 Marcando notificação como lida: ${notificationId}`);
      
      // Atualiza no Firestore
      const notificationDoc = doc(this._firestore, PATH_NOTIFICATIONS, notificationId);
      await updateDoc(notificationDoc, {
        isRead: true
      });

      // O listener em tempo real irá atualizar automaticamente o signal
      console.log(`✅ Notificação ${notificationId} marcada como lida no Firestore`);

    } catch (error) {
      console.error(`❌ Erro ao marcar notificação como lida:`, error);
      throw error;
    }
  }

  /**
   * Marca todas as notificações como lidas
   */
  async markAllAsRead(isMessageNotification: boolean): Promise<void> {
    try {
      console.log(`📢 Marcando todas as notificações como lidas: ${isMessageNotification ? 'MENSAGENS' : 'SISTEMA'}`);
      
      const notifications = isMessageNotification ? this.messageNotifications() : this.notifications();
      const unreadNotifications = notifications.filter(n => !n.isRead);

      // Atualiza cada notificação não lida no Firestore
      const updatePromises = unreadNotifications.map(notification => 
        this.markAsRead(notification.id!)
      );

      await Promise.all(updatePromises);
      
      console.log(`✅ ${unreadNotifications.length} notificações marcadas como lidas`);

    } catch (error) {
      console.error('❌ Erro ao marcar todas as notificações como lidas:', error);
      throw error;
    }
  }

  /**
   * Cria e salva uma nova notificação no Firestore
   */
  async createNotification(
  titleNotification: string,
  notificationType: NotificationType,
  content: string,
  isMessageNotification: boolean = false,
  path: string | null
): Promise<void> {
  try {
    const currentUser = this._sessionService.getSession();
    if (!currentUser) {
      console.warn('⚠️ Nenhum usuário logado — notificação não criada.');
      return;
    }

    // Monta o objeto da notificação
    const notification: Omit<Notifications, 'id'> = {
      title: titleNotification,
      content,
      created: new Date(),
      iconType: notificationType,
      isRead: false,
      isMessageNotification,
      userId: this.userLogged.id || null,
      helpDeskId: currentUser.helpDeskCompanyId!,
      path: path 
    };

    const docRef = await addDoc(this._notificationsCollection, notification);
    console.log(`✅ Notificação criada com ID: ${docRef.id}`);

  } catch (error) {
    console.error('❌ Erro ao criar notificação:', error);
    throw error;
  }
}


  /**
   * Obtém o número de notificações não lidas
   */
  getUnreadCount(isMessageNotification: boolean): number {
    const notifications = isMessageNotification ? this.messageNotifications() : this.notifications();
    return notifications.filter(notification => !notification.isRead).length;
  }

  /**
   * Obtém o número total de notificações não lidas
   */
  getTotalUnreadCount(): number {
    return this.getUnreadCount(false) + this.getUnreadCount(true);
  }

  /**
   * Limpa o listener quando o serviço é destruído
   */
  ngOnDestroy(): void {
    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }
}