import { inject, Injectable, signal } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  CollectionReference,
  orderBy,
  documentId
} from '@angular/fire/firestore';
import { SessionService } from './session.service';
import { User } from '../models/models';

const PATH_CLIENTS = 'clients';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private _firestore = inject(Firestore);
  private _sessionService = inject(SessionService);

  // Getter lazy para a coleção de clients
  private get _clientsCollection(): CollectionReference {
    return collection(this._firestore, PATH_CLIENTS);
  }

  /**
   * Busca clientes por IDs
   * @param clientIds Array de IDs dos clientes
   * @returns Array de clientes
   */
  async getClientsByIds(clientIds: string[]): Promise<User[]> {
    try {
      if (!clientIds || clientIds.length === 0) {
        console.log('ℹ️ Nenhum ID de cliente fornecido');
        return [];
      }
  
      console.log('🔍 Buscando clientes por IDs:', clientIds);
  
      const currentUser = this._sessionService.getSession();
      if (!currentUser) {
        console.log('❌ Usuário não está logado');
        return [];
      }
  
      // Firestore limita a 10 IDs por query, então fazemos em lotes se necessário
      const batches = [];
      for (let i = 0; i < clientIds.length; i += 10) {
        const batch = clientIds.slice(i, i + 10);
        const clientsQuery = query(
          this._clientsCollection,
          where(documentId(), 'in', batch)
        );
        batches.push(getDocs(clientsQuery));
      }
  
      const querySnapshots = await Promise.all(batches);
      
      const clients = querySnapshots.flatMap(snapshot => 
        snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('📄 Dados do cliente encontrado:', { id: doc.id, data });
          
          const client: any = {
            id: doc.id,
            name: data['name'] || 'Sem nome',
            ...data
          };
          return client;
        })
      );
  
      console.log(`✅ ${clients.length} cliente(s) encontrado(s) de ${clientIds.length} ID(s) solicitado(s)`);
      
      // Verifica se algum ID não foi encontrado
      const foundIds = clients.map(client => client.id);
      const missingIds = clientIds.filter(id => !foundIds.includes(id));
      if (missingIds.length > 0) {
        console.warn('⚠️ IDs de clientes não encontrados:', missingIds);
      }
  
      return clients;
  
    } catch (error) {
      console.error('❌ Erro ao buscar clientes por IDs:', error);
      return [];
    }
  }

  /**
   * Busca todos os clientes
   * @param includeDeleted Flag para incluir clientes excluídos
   * @returns Array de clientes
   */
  async getAllClients(includeDeleted: boolean = false): Promise<User[]> {
    try {
      console.log(`👥 Carregando todos os clientes - includeDeleted: ${includeDeleted}`);

      const currentUser = this._sessionService.getSession();
      if (!currentUser) {
        console.log('❌ Usuário não está logado');
        return [];
      }

      let clientsQuery;

      if (!includeDeleted) {
        clientsQuery = query(
          this._clientsCollection,
          where('deleted', '==', false),
          orderBy('name')
        );
      } else {
        clientsQuery = query(
          this._clientsCollection,
          orderBy('name')
        );
      }

      const querySnapshot = await getDocs(clientsQuery);
      
      const clients = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data['name'],
          email: data['email'],
          phone: data['phone'],
          // Adicione outros campos conforme sua interface User
          ...data
        } as User;
      });

      console.log(`✅ Todos os clientes carregados: ${clients.length} itens`);
      return clients;

    } catch (error) {
      console.error('❌ Erro ao carregar todos os clientes:', error);
      return [];
    }
  }
}