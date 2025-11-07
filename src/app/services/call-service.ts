import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  CollectionReference,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from '@angular/fire/firestore';
import { SessionService } from './session.service';
import { Call, Company, User } from '../models/models';
import { CompanyService } from './company';
import { ClientService } from './client';
import { OperatorService } from './operator-service';
import { HelpdeskCompanyService } from './helpdesk-company-service';
import { NotificationService } from './notification';
import { NotificationTitle, NotificationType } from '../enuns/notification-icon-types.enum';

const PATH_CALLS = 'calls';

@Injectable({
  providedIn: 'root',
})
export class CallService {
  private _firestore = inject(Firestore);
  private _sessionService = inject(SessionService);
  private _companyService = inject(CompanyService);
  private _clientService = inject(ClientService);
  private _operatorService = inject(OperatorService);
  private _helpdeskCompanyService = inject(HelpdeskCompanyService);
  private notificationService = inject(NotificationService);
  
  currentUser = this._sessionService.getSession();

  // 🔹 Getter lazy da coleção "calls"
  private get _callsCollection(): CollectionReference {
    return collection(this._firestore, PATH_CALLS);
  }

  /**
   * 💾 Cria ou atualiza um chamado
   */
  async saveCall(callData: Call): Promise<Call> {
  try {
    const currentUser = this._sessionService.getSession();
    if (!currentUser) throw new Error('Usuário não está logado');

    const now = new Date();

    // 🟢 Novo chamado (sem id definido)
    if (!callData.id) {
      const newCall: Omit<Call, 'id'> = {
        deleted: false,
        created: now,
        updated: now,
        finalizedDate: callData.closed ? now : null as any,
        companyId: callData.companyId!,
        clientId: callData.clientId!,
        title: callData.title!,
        description: callData.description!,
        resolution: callData.resolution ?? '',
        tags: callData.tags ?? [],
        connection: callData.connection ?? '',
        closed: callData.closed ?? false,
        operatorId: callData.operatorId ?? currentUser.id,
        helpDeskCompanyId: callData.helpDeskCompanyId ?? '',
      };

      // 🔹 Cria o documento e deixa o Firebase gerar o ID
      const docRef = await addDoc(this._callsCollection, newCall);

      // 🔹 Atualiza o campo `id` dentro do próprio documento
      await updateDoc(docRef, { id: docRef.id });

      // 🔹 Monta o objeto completo com o id
      const createdCall: Call = {
        id: docRef.id,
        ...newCall,
      };

      console.log('✅ Chamado criado com ID Firebase:', docRef.id);
      return createdCall;
    }

    // 🟢 Atualização de chamado existente
    const docRef = doc(this._callsCollection, callData.id);
    const updatePayload = {
      ...callData,
      updated: now,
    };

    await updateDoc(docRef, updatePayload);

    const updatedCall: Call = {
      ...updatePayload,
    };

    console.log('✅ Chamado atualizado com ID:', callData.id);
          this.notificationService.createNotification(
            NotificationTitle.CREATE_CALL,
            NotificationType.SUCCESS,
            `Chamado ${updatedCall.title} Criado com sucesso!`,
            false,
            `call/${updatedCall.id}`,
          );
    return updatedCall;

  } catch (error) {
    console.error('❌ Erro ao salvar chamado:', error);
    throw error;
  }
}


  /**
   * 🔍 Busca todos os chamados com objetos relacionados populados
   */
  async getAllCalls(operatorId?: string, helpDeskCompanyId?: string): Promise<Call[]> {
    try {
      console.log('Iniciando usuário', this.currentUser);
      const actualHelpDeskId = helpDeskCompanyId || this.currentUser?.helpDeskCompanyId;
      
      if (!actualHelpDeskId) {
        console.error('❌ helpDeskCompanyId não fornecido e usuário não está logado');
        return [];
      }

      let callsQuery;

      if (operatorId) {
        callsQuery = query(
          this._callsCollection,
          where('helpDeskCompanyId', '==', actualHelpDeskId),
          where('operatorId', '==', operatorId),
          orderBy('created', 'desc')
        );
      } else {
        callsQuery = query(
          this._callsCollection,
          where('helpDeskCompanyId', '==', actualHelpDeskId),
          orderBy('created', 'desc')
        );
      }

      const snapshot = await getDocs(callsQuery);

      // Primeiro mapeia os chamados básicos
      const calls = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return this.mapFirestoreDataToCall(docSnap.id, data);
      });

      console.log(`📋 ${calls.length} chamado(s) carregado(s)`);

      // 🔄 Popula os objetos relacionados
      const populatedCalls = await this.populateRelatedObjects(calls);
      
      return populatedCalls;
    } catch (error) {
      console.error('❌ Erro ao buscar chamados:', error);
      return [];
    }
  }

  /**
   * 🔍 Busca um chamado específico pelo ID com objetos relacionados
   */
  async getCallById(callId: string): Promise<Call | null> {
    try {
      const docRef = doc(this._callsCollection, callId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.warn('⚠️ Chamado não encontrado:', callId);
        return null;
      }

      const data = docSnap.data();
      const call = this.mapFirestoreDataToCall(docSnap.id, data);

      // 🔄 Popula os objetos relacionados
      const populatedCall = await this.populateRelatedObjects([call]);
      
      return populatedCall[0] || null;
    } catch (error) {
      console.error('❌ Erro ao buscar chamado:', error);
      return null;
    }
  }

  /**
   * 🗺️ Converte dados do Firestore para o modelo Call
   */
  private mapFirestoreDataToCall(id: string, data: any): Call {
  const created = data['created']?.toDate?.() || new Date(data['created'] || Date.now());
  const updated = data['updated']?.toDate?.() || new Date(data['updated'] || Date.now());

  return {
    id,
    deleted: data['deleted'] ?? false,
    created, // Date
    updated, // Date
    companyId: data['companyId'],
    clientId: data['clientId'],
    title: data['title'],
    description: data['description'],
    resolution: data['resolution'] || '',
    tags: data['tags'] || [],
    connection: data['connection'] || '',
    closed: data['closed'] ?? false,
    finalizedDate: data['finalizedDate'] ? (data['finalizedDate'].toDate?.() || new Date(data['finalizedDate'])) : undefined,
    operatorId: data['operatorId'],
    helpDeskCompanyId: data['helpDeskCompanyId'],
  } as Call; // Força o tipo
}

  /**
   * 🔄 Popula os objetos relacionados (company, client, operator)
   */
  private async populateRelatedObjects(calls: Call[]): Promise<Call[]> {
    try {
      const companyIds = [...new Set(calls.map(c => c.companyId).filter(Boolean))];
      const clientIds = [...new Set(calls.map(c => c.clientId).filter(Boolean))];
      const operatorIds = [...new Set(calls.map(c => c.operatorId).filter(Boolean))];
      const helpDeskIds  = [...new Set(calls.map(c => c.helpDeskCompanyId).filter(Boolean) as string[])];

      console.log('Populando:', { companyIds, clientIds, operatorIds, helpDeskIds });

      const [companies, clients, operators, helpDesks] = await Promise.all([
        this._companyService.loadAllCompanies(),
        this._clientService.getClientsByIds(clientIds),
        this._operatorService.getOperatorsByIds(operatorIds),
        this._helpdeskCompanyService.getHelpdeskCompaniesByIds(helpDeskIds) // NOVO
      ]);

      const companyMap = new Map(companies.map(c => [c.id, c]));
      const clientMap = new Map(clients.map(c => [c.id, c]));
      const operatorMap = new Map(operators.map(o => [o.id, o]));
      const helpDeskMap = new Map(helpDesks.map(h => [h.id, h])); // NOVO

      return calls.map(call => ({
        ...call,
        company: companyMap.get(call.companyId),
        client: clientMap.get(call.clientId),
        operator: operatorMap.get(call.operatorId),
        helpDeskCompany: helpDeskMap.get(call.helpDeskCompanyId) // NOVO
      }));
    } catch (error) {
      console.error('Erro ao popular objetos relacionados:', error);
      return calls;
    }
  }

  
}