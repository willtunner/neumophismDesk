// chat.component.ts
import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  type: 'sent' | 'received' | 'system';
}

interface ChatSession {
  id: string;
  clientId: string;
  operatorId: string;
  status: 'waiting' | 'active' | 'closed';
  messages: ChatMessage[];
  startTime: Date;
}

interface Operator {
  id: string;
  name: string;
  sector: string;
  status: 'online' | 'busy' | 'offline';
  currentChats: number;
  maxChats: number;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Signals
  operators = signal<Operator[]>([
    { id: '1', name: 'ANDREAH', sector: 'Arquivos Fiscais', status: 'online', currentChats: 0, maxChats: 3 },
    { id: '2', name: 'Erisvaldo', sector: 'Arquivos Fiscais', status: 'online', currentChats: 1, maxChats: 3 },
    { id: '3', name: 'Washington', sector: 'Arquivos Fiscais', status: 'busy', currentChats: 1, maxChats: 3 },
    { id: '4', name: 'William', sector: 'Arquivos Fiscais', status: 'offline', currentChats: 0, maxChats: 3 }
  ]);

  chatSessions = signal<ChatSession[]>([]);
  activeChat = signal<ChatSession | null>(null);
  newMessage = signal('');
  isClientView = signal(false);
  currentClientId = signal('');

  // Computed values
  waitingClients = computed(() =>
    this.chatSessions().filter(session => session.status === 'waiting').length
  );

  availableOperators = computed(() =>
    this.operators().filter(op =>
      op.status === 'online' && op.currentChats < op.maxChats
    ).length
  );

  ngOnInit() {
    // Simular alguns clientes na fila
    this.simulateWaitingClients();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Operador: Iniciar chat com cliente
  startChat(operator: Operator, clientId: string) {
    if (operator.status !== 'online' || operator.currentChats >= operator.maxChats) {
      return;
    }

    // Atualizar sessão existente ou criar nova
    const existingSession = this.chatSessions().find(
      session => session.clientId === clientId
    );

    if (existingSession) {
      // Atualizar sessão existente
      this.chatSessions.update(sessions =>
        sessions.map(session =>
          session.clientId === clientId
            ? {
                ...session,
                operatorId: operator.id,
                status: 'active',
                messages: [
                  ...session.messages,
                  {
                    id: `msg_${Date.now()}`,
                    sender: 'system',
                    message: `Você foi conectado com ${operator.name}`,
                    timestamp: new Date(),
                    type: 'system'
                  }
                ]
              }
            : session
        )
      );
    } else {
      // Criar nova sessão
      const session: ChatSession = {
        id: `chat_${Date.now()}`,
        clientId,
        operatorId: operator.id,
        status: 'active',
        messages: [
          {
            id: '1',
            sender: 'system',
            message: `Chat iniciado com ${operator.name}`,
            timestamp: new Date(),
            type: 'system'
          }
        ],
        startTime: new Date()
      };

      this.chatSessions.update(sessions => [...sessions, session]);
    }

    // Definir como chat ativo
    const activeSession = this.chatSessions().find(
      session => session.clientId === clientId && session.status === 'active'
    );
    
    if (activeSession) {
      this.activeChat.set(activeSession);
    }
    
    // Atualizar status do operador
    this.updateOperatorStatus(operator.id, operator.currentChats + 1);
  }

  // Operador: Enviar mensagem
  sendOperatorMessage() {
    const message = this.newMessage().trim();
    const chat = this.activeChat();
    
    if (!message || !chat) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: chat.operatorId,
      message,
      timestamp: new Date(),
      type: 'sent'
    };

    this.chatSessions.update(sessions =>
      sessions.map(session =>
        session.id === chat.id
          ? { ...session, messages: [...session.messages, newMsg] }
          : session
      )
    );

    this.newMessage.set('');
  }

  // Cliente: Enviar mensagem
  sendClientMessage() {
    const message = this.newMessage().trim();
    const clientId = this.currentClientId();
    
    if (!message || !clientId) return;

    const activeSession = this.chatSessions().find(
      session => session.clientId === clientId && session.status === 'active'
    );

    if (!activeSession) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: clientId,
      message,
      timestamp: new Date(),
      type: 'sent'
    };

    this.chatSessions.update(sessions =>
      sessions.map(session =>
        session.id === activeSession.id
          ? { ...session, messages: [...session.messages, newMsg] }
          : session
      )
    );

    this.newMessage.set('');
  }

  // Cliente: Entrar na fila
  joinQueue() {
    const clientId = `client_${Date.now()}`;
    this.currentClientId.set(clientId);
    
    const session: ChatSession = {
      id: `session_${Date.now()}`,
      clientId,
      operatorId: '',
      status: 'waiting',
      messages: [
        {
          id: '1',
          sender: 'system',
          message: 'Você entrou na fila de atendimento. Aguarde...',
          timestamp: new Date(),
          type: 'system'
        }
      ],
      startTime: new Date()
    };

    this.chatSessions.update(sessions => [...sessions, session]);
    this.isClientView.set(true);
  }

  // Operador: Finalizar chat
  endChat(chatId: string) {
    const session = this.chatSessions().find(s => s.id === chatId);
    if (!session) return;

    // Adicionar mensagem de finalização
    this.chatSessions.update(sessions =>
      sessions.map(s =>
        s.id === chatId
          ? {
              ...s,
              status: 'closed',
              messages: [
                ...s.messages,
                {
                  id: `msg_${Date.now()}`,
                  sender: 'system',
                  message: 'Chat finalizado',
                  timestamp: new Date(),
                  type: 'system'
                }
              ]
            }
          : s
      )
    );

    // Atualizar status do operador
    const operator = this.operators().find(op => op.id === session.operatorId);
    if (operator) {
      this.updateOperatorStatus(operator.id, operator.currentChats - 1);
    }

    if (this.activeChat()?.id === chatId) {
      this.activeChat.set(null);
    }
  }

  // Utilitários
  private updateOperatorStatus(operatorId: string, currentChats: number) {
    this.operators.update(ops =>
      ops.map(op =>
        op.id === operatorId 
          ? { 
              ...op, 
              currentChats,
              status: currentChats >= op.maxChats ? 'busy' : 
                     currentChats === 0 ? 'online' : op.status
            }
          : op
      )
    );
  }

  private simulateWaitingClients() {
    // Simular alguns clientes na fila após um tempo
    setTimeout(() => {
      const clientId = `client_sim_${Date.now()}`;
      const session: ChatSession = {
        id: `session_sim_${Date.now()}`,
        clientId,
        operatorId: '',
        status: 'waiting',
        messages: [
          {
            id: '1',
            sender: 'system',
            message: 'Cliente simulado aguardando atendimento',
            timestamp: new Date(),
            type: 'system'
          }
        ],
        startTime: new Date()
      };
      this.chatSessions.update(sessions => [...sessions, session]);
    }, 3000);
  }

  getOperatorName(operatorId: string): string {
    return this.operators().find(op => op.id === operatorId)?.name || 'Operador';
  }

  getOperatorSession(operatorId: string): ChatSession | undefined {
    return this.chatSessions().find(
      session => session.operatorId === operatorId && session.status === 'active'
    );
  }

  getClientSession(clientId: string): ChatSession | undefined {
    return this.chatSessions().find(
      session => session.clientId === clientId && (session.status === 'active' || session.status === 'waiting')
    );
  }

  switchToOperatorView() {
    this.isClientView.set(false);
    this.currentClientId.set('');
  }

  switchToClientView() {
    this.isClientView.set(true);
  }

  /**
 * Retorna a classe CSS baseada no status do operador
 */
  getOperatorStatusClass(operator: Operator): string {
    return operator.status;
  }

  /**
 * Handler para duplo clique no operador
 */
  onOperatorDblClick(operator: Operator) {
    if (operator.status !== 'online' || operator.currentChats >= operator.maxChats) {
      console.log('Operador não disponível');
      return;
    }

    // Encontrar um cliente na fila de espera
    const waitingSession = this.chatSessions().find(
      session => session.status === 'waiting'
    );

    if (waitingSession) {
      this.startChat(operator, waitingSession.clientId);
    } else {
      // Se não há clientes na fila, criar um simulado
      const simulatedClientId = `client_${Date.now()}`;
      this.startChat(operator, simulatedClientId);

      // Adicionar mensagem informativa
      this.chatSessions.update(sessions =>
        sessions.map(session =>
          session.clientId === simulatedClientId
            ? {
              ...session,
              messages: [
                ...session.messages,
                {
                  id: `msg_${Date.now()}`,
                  sender: 'system',
                  message: 'Cliente simulado para demonstração',
                  timestamp: new Date(),
                  type: 'system'
                }
              ]
            }
            : session
        )
      );
    }
  }


  /**
   * Função "Mestrar Todos" - Atribui operadores disponíveis aos clientes na fila
   */
  masterAll() {
    const waitingSessions = this.chatSessions().filter(
      session => session.status === 'waiting'
    );
    
    const availableOps = this.operators().filter(
      op => op.status === 'online' && op.currentChats < op.maxChats
    );

    let opIndex = 0;
    
    waitingSessions.forEach(session => {
      if (opIndex < availableOps.length) {
        const operator = availableOps[opIndex];
        this.startChat(operator, session.clientId);
        opIndex++;
      }
    });

    if (waitingSessions.length === 0) {
      console.log('Não há clientes na fila para atendimento');
    } else if (availableOps.length === 0) {
      console.log('Não há operadores disponíveis');
    }
  }

   /**
   * Retorna o texto do status da sessão para exibição
   */
   getSessionStatusText(status: 'waiting' | 'active' | 'closed'): string {
    const statusMap = {
      waiting: 'Aguardando atendimento',
      active: 'Em atendimento',
      closed: 'Finalizado'
    };
    
    return statusMap[status] || status;
  }

  /**
   * Calcula e formata a duração da sessão de chat
   */
  getSessionDuration(session: ChatSession): string {
    const now = new Date();
    const start = new Date(session.startTime);
    const diffMs = now.getTime() - start.getTime();
    
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes}m`;
    }
  }



}