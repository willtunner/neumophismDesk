import { Injectable, signal, computed, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  Timestamp 
} from '@angular/fire/firestore';
import { WaintingListClients, Client } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class Chat2Service {
  private firestore = inject(Firestore);
  
  private waitingListCollection = collection(this.firestore, 'waitingList');
  
  // Signal para guardar os clientes que estão na lista de espera
  private _waintingListClients = signal<WaintingListClients[]>([]);

  // Signal readonly para ser consumido pelos componentes
  public waintingListClients = computed(() => this._waintingListClients());

  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.setupFirebaseListener();
  }

  // Configura o listener em tempo real do Firebase
  private setupFirebaseListener(): void {
    const q = query(this.waitingListCollection, orderBy('timestamp', 'asc'));
    
    this.unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const clients: WaintingListClients[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          clients.push({
            id: doc.id,
            ...data,
          } as WaintingListClients);
        });

        console.log('🔥 Firebase - Lista atualizada:', clients);
        this._waintingListClients.set(clients);
      },
      (error) => {
        console.error('🔥 Firebase - Erro no listener:', error);
      }
    );
  }

  // Converte Timestamp do Firebase para string
  private convertTimestamp(timestamp: any): string {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toISOString();
    }
    return timestamp || new Date().toISOString();
  }

  // Método para adicionar cliente à lista de espera
  async addClientToWaitingList(clientData: WaintingListClients): Promise<void> {
    console.log('Adicionando cliente à addClientToWaitingList:', clientData);
    try {
      // Garante que temos um ID único
      const clientId = clientData.client.id || this.generateId();
      
      const clientWithId: WaintingListClients = {
        ...clientData,
        timestamp: new Date().toISOString()
      };

      // Salva no Firebase
      const clientDoc = doc(this.waitingListCollection, clientId);
      await setDoc(clientDoc, {
        name: clientWithId.name,
        occurrence: clientWithId.occurrence,
        timestamp: Timestamp.fromDate(new Date(clientWithId.timestamp)),
        client: clientData.client
      });

      console.log('✅ Cliente adicionado ao Firebase:', clientWithId);
    } catch (error) {
      console.error('❌ Erro ao adicionar cliente no Firebase:', error);
      throw error;
    }
  }

  // Método para remover cliente da lista de espera
  async removeClientFromWaitingList(clientId: string): Promise<void> {
    try {
      const clientDoc = doc(this.waitingListCollection, clientId);
      await deleteDoc(clientDoc);
      console.log('✅ Cliente removido do Firebase:', clientId);
    } catch (error) {
      console.error('❌ Erro ao remover cliente do Firebase:', error);
      throw error;
    }
  }

  // Método para limpar toda a lista de espera
  async clearWaitingList(): Promise<void> {
    try {
      const clients = this._waintingListClients();
      const deletePromises = clients.map(client => 
        this.removeClientFromWaitingList(client.client.id)
      );
      await Promise.all(deletePromises);
      console.log('✅ Lista de espera limpa no Firebase');
    } catch (error) {
      console.error('❌ Erro ao limpar lista do Firebase:', error);
      throw error;
    }
  }

  // Método para obter um cliente específico da lista
  getClientFromWaitingList(clientId: string): WaintingListClients | undefined {
    return this._waintingListClients().find(item => item.client.id === clientId);
  }

  // Gera ID único se necessário
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Limpa o listener quando o serviço for destruído
  ngOnDestroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      console.log('🔴 Listener do Firebase removido');
    }
  }
}