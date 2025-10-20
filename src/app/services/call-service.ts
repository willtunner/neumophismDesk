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
  serverTimestamp,
} from '@angular/fire/firestore';
import { SessionService } from './session.service';
import { Call } from '../models/models';
import { setDoc } from 'firebase/firestore';

const PATH_CALLS = 'calls';

@Injectable({
  providedIn: 'root',
})
export class CallService {
  private _firestore = inject(Firestore);
  private _sessionService = inject(SessionService);

  // 🔹 Getter lazy da coleção "calls"
  private get _callsCollection(): CollectionReference {
    return collection(this._firestore, PATH_CALLS);
  }

  /**
   * 💾 Cria ou atualiza um chamado
   * @param callData Dados do chamado (sem id para criar novo, com id para atualizar)
   * @returns ID do documento criado ou atualizado
   */
  async saveCall(callData: Call): Promise<string> {
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

        console.log('✅ Chamado criado com ID Firebase:', docRef.id);
        return docRef.id;
      }

      // 🟢 Atualização de chamado existente
      const docRef = doc(this._callsCollection, callData.id);
      const updatePayload = {
        ...callData,
        updated: now,
      };

      await updateDoc(docRef, updatePayload);
      console.log('✅ Chamado atualizado com ID:', callData.id);
      return callData.id;

    } catch (error) {
      console.error('❌ Erro ao salvar chamado:', error);
      throw error;
    }
  }

  /**
   * 🔍 Busca todos os chamados (opcionalmente filtrando por operador)
   */
  async getAllCalls(operatorId?: string): Promise<Call[]> {
    try {
      let callsQuery;

      if (operatorId) {
        callsQuery = query(
          this._callsCollection,
          where('operatorId', '==', operatorId),
          orderBy('created', 'desc')
        );
      } else {
        callsQuery = query(this._callsCollection, orderBy('created', 'desc'));
      }

      const snapshot = await getDocs(callsQuery);

      const calls = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Omit<Call, 'id'>;
        return {
          id: docSnap.id,
          ...data,
          created: data.created ? new Date(data.created as any) : null,
          updated: data.updated ? new Date(data.updated as any) : null,
          finalizedDate: data.finalizedDate
            ? new Date(data.finalizedDate as any)
            : null,
        } as Call;
      });

      console.log(`📋 ${calls.length} chamado(s) carregado(s)`);
      return calls;
    } catch (error) {
      console.error('❌ Erro ao buscar chamados:', error);
      return [];
    }
  }

  /**
   * 🔍 Busca um chamado específico pelo ID
   */
  async getCallById(callId: string): Promise<Call | null> {
    try {
      const docRef = doc(this._callsCollection, callId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.warn('⚠️ Chamado não encontrado:', callId);
        return null;
      }

      const data = docSnap.data() as Omit<Call, 'id'>;
      return {
        id: docSnap.id,
        ...data,
        created: data.created ? new Date(data.created as any) : null,
        updated: data.updated ? new Date(data.updated as any) : null,
        finalizedDate: data.finalizedDate
          ? new Date(data.finalizedDate as any)
          : null,
      } as Call;
    } catch (error) {
      console.error('❌ Erro ao buscar chamado:', error);
      return null;
    }
  }
}

