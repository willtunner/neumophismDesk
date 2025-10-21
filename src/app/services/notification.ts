import { inject, Injectable, signal } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  CollectionReference,
  orderBy,
} from '@angular/fire/firestore';
import { SessionService } from './session.service';
import { Notifications } from '../models/models';
import { NotificationType } from '../enuns/notification-icon-types.enum';
import { addDoc, getDoc } from 'firebase/firestore';

const PATH_NOTIFICATIONS = 'notifications';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private _firestore = inject(Firestore);
  private _sessionService = inject(SessionService);

  // Signal para as notificações
  notifications = signal<Notifications[]>([]);
  messageNotifications = signal<Notifications[]>([]);

  constructor() {
    // Carrega as notificações iniciais se o usuário estiver logado
    const session = this._sessionService.getSession();
    if (session) {
      this.loadNotifications(false); // Notificações do sistema
      this.loadNotifications(true);  // Notificações de mensagens
    }
  }

  // Getter lazy para a coleção de notificações
  private get _notificationsCollection(): CollectionReference {
    return collection(this._firestore, PATH_NOTIFICATIONS);
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

      // Cria a query base
      let notificationsQuery = query(
        this._notificationsCollection,
        where('isMessageNotification', '==', isMessageNotification),
        orderBy('created', 'desc')
      );

      const querySnapshot = await getDocs(notificationsQuery);
      
      // Filtra as notificações pelo userId do usuário logado
      const filteredNotifications = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          const notification: Notifications = {
            id: doc.id,
            title: data['title'],
            content: data['content'],
            created: data['created']?.toDate(),
            iconType: data['iconType'],
            isRead: data['isRead'] || false,
            isMessageNotification: data['isMessageNotification'] || false,
            userId: data['userId']
          };
          return notification;
        })
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
   * Marca uma notificação como lida
   */
  async markAsRead(notificationId: string): Promise<void> {
    // Implementar atualização no Firestore quando necessário
    console.log(`📢 Marcando notificação como lida: ${notificationId}`);
    
    // Atualiza localmente
    const allNotifications = [...this.notifications(), ...this.messageNotifications()];
    const notification = allNotifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.isRead = true;
      
      // Atualiza o signal correspondente
      if (notification.isMessageNotification) {
        this.messageNotifications.update(notifications => 
          notifications.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
      } else {
        this.notifications.update(notifications => 
          notifications.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
      }
    }
  }

  /**
   * Marca todas as notificações como lidas
   */
  markAllAsRead(isMessageNotification: boolean): void {
    console.log(`📢 Marcando todas as notificações como lidas: ${isMessageNotification ? 'MENSAGENS' : 'SISTEMA'}`);
    
    if (isMessageNotification) {
      this.messageNotifications.update(notifications => 
        notifications.map(notification => ({ ...notification, isRead: true }))
      );
    } else {
      this.notifications.update(notifications => 
        notifications.map(notification => ({ ...notification, isRead: true }))
      );
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
 * Cria e salva uma nova notificação no Firestore
 */
async createNotification(
  titleNotification: string, 
  notificationType: NotificationType,
  content: string,
  isMessageNotification: boolean = true
): Promise<void> {
  try {
    const currentUser = this._sessionService.getSession();

    if (!currentUser) {
      console.warn('⚠️ Nenhum usuário logado — notificação não criada.');
      return;
    }

    // Monta o objeto da notificação (sem id ainda)
    const notification: Omit<Notifications, 'id'> = {
      title: titleNotification,
      content,
      created: new Date(),
      iconType: notificationType,
      isRead: false,
      isMessageNotification,
      userId: currentUser.id
    };

    // Adiciona ao Firestore (gera o id automaticamente)
    const docRef = await addDoc(this._notificationsCollection, notification);

    // Busca o id gerado
    const savedDoc = await getDoc(docRef);
    const savedNotification: Notifications = {
      id: savedDoc.id,
      ...notification
    };

    // Atualiza o signal correspondente localmente
    if (isMessageNotification) {
      this.messageNotifications.update((notifications) => [
        savedNotification,
        ...notifications
      ]);
    } else {
      this.notifications.update((notifications) => [
        savedNotification,
        ...notifications
      ]);
    }

    console.log(`✅ Notificação criada com ID Firestore: ${savedDoc.id}`, savedNotification);

  } catch (error) {
    console.error('❌ Erro ao criar notificação:', error);
  }
}

}