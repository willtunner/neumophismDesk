import { inject, Injectable, signal } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  CollectionReference,
  orderBy,
  addDoc,
  documentId
} from '@angular/fire/firestore';
import { SessionService } from './session.service';
import { Client, Company, User } from '../models/models';
import { NotificationService } from './notification';
import { NotificationTitle, NotificationType } from '../enuns/notification-icon-types.enum';

const PATH_CLIENTS = 'clients';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private _firestore = inject(Firestore);
  private _sessionService = inject(SessionService);
  private notificationService = inject(NotificationService);
  clients = signal<Client[]>([]);

  // Getter lazy para a coleção de clients
  private get _clientsCollection(): CollectionReference {
    return collection(this._firestore, PATH_CLIENTS);
  }

  /**
   * Busca clientes por empresa
   * @param companyId ID da empresa
   * @returns Array de clientes
   */
  async loadClientsByCompany(companyId: string): Promise<User[]> {
    try {
      console.log('👥 Buscando clientes da empresa:', companyId);

      const currentUser = this._sessionService.getSession();
      if (!currentUser) {
        console.log('❌ Usuário não está logado');
        return [];
      }

      // Cria a query para buscar clientes da empresa e não deletados
      const clientsQuery = query(
        this._clientsCollection,
        where('companyId', '==', companyId),
        where('deleted', '==', false),
        orderBy('name', 'asc')
      );

      const querySnapshot = await getDocs(clientsQuery);
      
      const clients = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const client: User = {
          id: doc.id,
          name: data['name'],
          email: data['email'],
          phone: data['phone'],
          companyId: data['companyId'],
          deleted: data['deleted'] || false,
          created: data['created'] || new Date(),
          updated: data['updated'] || null,
          imageUrl: data['imageUrl'],
          roles: data['roles'],
          username: data['username'],
          isLoggedIn: data['isLoggedIn'],
          helpDeskCompanyId: data['helpDeskCompanyId'],
          password: data['password'],
          ...data
        };
        return client;
      });

      console.log(`✅ ${clients.length} cliente(s) encontrado(s) para a empresa ${companyId}`);
      return clients;

    } catch (error) {
      console.error('❌ Erro ao buscar clientes por empresa:', error);
      return [];
    }
  }

  /**
   * Salva um novo cliente
   * @param clientData Dados do cliente
   * @returns Cliente salvo
   */
  async saveClient(clientData: Omit<User, 'id' | 'created' | 'updated'>, companySelected?: Company): Promise<User> {
  try {
    console.log('💾 Salvando cliente:', clientData);

    const currentUser = this._sessionService.getSession();
    if (!currentUser) {
      throw new Error('Usuário não está logado');
    }

    const now = new Date();

    // Prepara os dados do novo cliente
    const newClient = {
      ...clientData,
      deleted: false,
      created: now,
      updated: null
    };

    // Adiciona o cliente no Firestore
    const docRef = await addDoc(this._clientsCollection, newClient);

    // Cria o objeto User completo com o ID gerado
    const createdClient: User = {
      id: docRef.id,
      ...newClient
    };

    console.log('✅ Cliente salvo com ID:', docRef.id);

    // 🆕 ATUALIZA A EMPRESA COM O NOVO CLIENTE
    await this.updateCompanyWithNewClient(createdClient.companyId!, docRef.id);

    // ENVIO DE NOTIFICAÇÃO
    this.notificationService.createNotification(
      NotificationTitle.CREATE_CLIENT,
      NotificationType.SUCCESS,
      `${createdClient.name} Criado com sucesso na empresa ${companySelected?.name }!`,
      false,
      `clients/${createdClient.id}`,
    );

    return createdClient;

  } catch (error) {
    console.error('❌ Erro ao salvar cliente:', error);
    throw error;
  }
}

/**
 * 🆕 Atualiza a empresa adicionando o ID do cliente no array clientsId
 * @param companyId ID da empresa
 * @param clientId ID do cliente
 */
private async updateCompanyWithNewClient(companyId: string, clientId: string): Promise<void> {
  try {
    console.log(`🏢 Atualizando empresa ${companyId} com novo cliente ${clientId}`);

    // Importa o CompanyService e o Firestore necessário
    const { doc, updateDoc, arrayUnion } = await import('@angular/fire/firestore');
    
    // Referência do documento da empresa
    const companyRef = doc(this._firestore, 'companies', companyId);
    
    // Atualiza a empresa adicionando o ID do cliente ao array clientsId
    await updateDoc(companyRef, {
      clientsId: arrayUnion(clientId),
      updated: new Date()
    });

    console.log(`✅ Empresa ${companyId} atualizada com sucesso. Cliente ${clientId} adicionado.`);

  } catch (error) {
    console.error(`❌ Erro ao atualizar empresa ${companyId} com cliente ${clientId}:`, error);
    // Não lançamos o erro aqui para não quebrar o fluxo principal de salvar o cliente
    console.warn('⚠️ Cliente foi salvo, mas a empresa não foi atualizada. Isso pode causar inconsistência.');
  }
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
  async getAllClients(includeDeleted: boolean = false): Promise<Client[]> {
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
          ...data
        } as Client;
      });

      console.log(`✅ Todos os clientes carregados: ${clients.length} itens`);
      return clients;

    } catch (error) {
      console.error('❌ Erro ao carregar todos os clientes:', error);
      return [];
    }
  }

  /**
 * Carrega todos os clientes
 */
async loadAllClients(): Promise<User[]> {
  try {
    console.log('👥 Carregando todos os clientes');

    const clients = await this.getAllClients();
    this.clients.set(clients);
    return clients;

  } catch (error) {
    console.error('❌ Erro ao carregar todos os clientes:', error);
    return [];
  }
}

/**
 * Busca cliente por ID
 */
async getClientById(clientId: string): Promise<Client | null> {
  try {
    console.log('🔍 Buscando cliente por ID:', clientId);

    const currentUser = this._sessionService.getSession();
    if (!currentUser) {
      console.log('❌ Usuário não está logado');
      return null;
    }

    const { doc, getDoc } = await import('@angular/fire/firestore');
    const clientRef = doc(this._firestore, PATH_CLIENTS, clientId);
    const clientSnap = await getDoc(clientRef);

    if (clientSnap.exists()) {
      const data = clientSnap.data();
      const client: Client = {
        id: clientSnap.id,
        name: data['name'],
        email: data['email'],
        phone: data['phone'],
        companyId: data['companyId'],
        deleted: data['deleted'] || false,
        created: data['created'] || new Date(),
        updated: data['updated'] || null,
        imageUrl: data['imageUrl'],
        roles: data['roles'],
        username: data['username'],
        isLoggedIn: data['isLoggedIn'],
        password: data['password'],
        connection: data['connection'],
        ...data
      };
      return client;
    }

    return null;

  } catch (error) {
    console.error('❌ Erro ao buscar cliente por ID:', error);
    return null;
  }
}

/**
 * Atualiza um cliente existente
 */
async updateClient(clientId: string, clientData: Partial<Omit<Client, 'id' | 'created' | 'helpDeskCompanyId'>>): Promise<Client> {
  try {
    console.log('📝 Atualizando cliente:', clientId, clientData);

    const currentUser = this._sessionService.getSession();
    if (!currentUser) {
      throw new Error('Usuário não está logado');
    }

    const { doc, updateDoc } = await import('@angular/fire/firestore');
    
    const updateData = {
      ...clientData,
      updated: new Date()
    };

    // Atualiza o cliente no Firestore
    const clientRef = doc(this._firestore, PATH_CLIENTS, clientId);
    await updateDoc(clientRef, updateData);

    // Busca o cliente atualizado
    const updatedClient = await this.getClientById(clientId);

    if (!updatedClient) {
      throw new Error('Cliente não encontrado após atualização');
    }

    console.log('✅ Cliente atualizado:', updatedClient);

    // Atualiza o signal com o cliente modificado
    this.clients.update(clients =>
      clients.map(client =>
        client.id === clientId ? updatedClient : client
      )
    );

    // ENVIO DE NOTIFICAÇÃO
    this.notificationService.createNotification(
      NotificationTitle.UPDATE_CLIENT,
      NotificationType.SUCCESS,
      `${updatedClient.name} atualizado com sucesso!`,
      false,
      `/clients/${updatedClient.id}`,
    );

    return updatedClient;

  } catch (error) {
    console.error('❌ Erro ao atualizar cliente:', error);
    throw error;
  }
}

/**
 * Exclui um cliente (marca como deletado)
 */
async deleteClient(clientId: string): Promise<boolean> {
  try {
    console.log('🗑️ Excluindo cliente:', clientId);

    const currentUser = this._sessionService.getSession();
    if (!currentUser) {
      throw new Error('Usuário não está logado');
    }

    const { doc, updateDoc } = await import('@angular/fire/firestore');

    // Atualiza o cliente marcando como deletado
    const clientRef = doc(this._firestore, PATH_CLIENTS, clientId);
    await updateDoc(clientRef, {
      deleted: true,
      updated: new Date()
    });

    console.log('✅ Cliente marcado como excluído:', clientId);

    // Remove o cliente do signal
    this.clients.update(clients =>
      clients.filter(client => client.id !== clientId)
    );

    // Busca o cliente para notificação
    const deletedClient = await this.getClientById(clientId);
    if (deletedClient) {
      this.notificationService.createNotification(
        NotificationTitle.DELETED_CLIENT,
        NotificationType.SUCCESS,
        `Cliente ${deletedClient.name} excluído com sucesso!`,
        false,
        null
      );
    }

    return true;

  } catch (error) {
    console.error('❌ Erro ao excluir cliente:', error);
    return false;
  }
}
}