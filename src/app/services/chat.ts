// chat.service.ts
import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface ChatEvent {
  type: 'message' | 'join' | 'leave' | 'assign';
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messageSubject = new Subject<ChatEvent>();
  public messages$ = this.messageSubject.asObservable();

  // Simular conexão SignalR
  connect(userId: string, userType: 'operator' | 'client') {
    console.log(`${userType} ${userId} conectado`);
    
    // Simular mensagens em tempo real
    if (userType === 'client') {
      setTimeout(() => {
        this.sendSystemMessage(userId, 'Bem-vindo ao suporte! Aguarde enquanto conectamos você a um operador.');
      }, 1000);
    }
  }

  sendMessage(from: string, to: string, message: string) {
    this.messageSubject.next({
      type: 'message',
      data: { from, to, message, timestamp: new Date() }
    });
  }

  sendSystemMessage(to: string, message: string) {
    this.messageSubject.next({
      type: 'message',
      data: { from: 'system', to, message, timestamp: new Date() }
    });
  }

  assignOperator(clientId: string, operatorId: string) {
    this.messageSubject.next({
      type: 'assign',
      data: { clientId, operatorId, timestamp: new Date() }
    });
  }
}