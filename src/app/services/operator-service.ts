import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  CollectionReference,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy
} from '@angular/fire/firestore';
import { SessionService } from './session.service';
import { User } from '../models/models';

const PATH_USERS = 'users';

@Injectable({
  providedIn: 'root'
})
export class OperatorService {
  private _firestore = inject(Firestore);
  private _sessionService = inject(SessionService);

  // Getter lazy para a coleção de users
  private get _usersCollection(): CollectionReference {
    return collection(this._firestore, PATH_USERS);
  }

  /**
   * 🔍 Busca operador por ID
   */
  async getOperatorById(operatorId: string): Promise<User | null> {
    try {
      if (!operatorId) {
        console.warn('⚠️ ID do operador não fornecido');
        return null;
      }

      const operatorRef = doc(this._firestore, PATH_USERS, operatorId);
      const operatorSnap = await getDoc(operatorRef);

      if (!operatorSnap.exists()) {
        console.warn('⚠️ Operador não encontrado:', operatorId);
        return null;
      }

      const data = operatorSnap.data();
      const operator: User = {
        id: operatorSnap.id,
        name: data['name'] || 'Sem nome',
        email: data['email'] || '',
        phone: data['phone'] || '',
        roles: data['role'] || 'OPERATOR',
        created: data['created'],
        deleted: data['deleted'],
        username: data['username'],
        imageUrl: data['imageUrl'],
        isLoggedIn: data['isLoggedIn'],
        password: data['password'],
        ...data
      };

      console.log('✅ Operador encontrado:', operator.name);
      return operator;

    } catch (error) {
      console.error('❌ Erro ao buscar operador:', error);
      return null;
    }
  }

  /**
   * 🔍 Busca operadores por IDs
   */
  async getOperatorsByIds(operatorIds: string[]): Promise<User[]> {
    try {
      if (!operatorIds || operatorIds.length === 0) {
        console.log('ℹ️ Nenhum ID de operador fornecido');
        return [];
      }

      console.log('🔍 Buscando operadores por IDs:', operatorIds);

      // Para múltiplos IDs, você precisaria de uma estratégia diferente
      // já que o Firestore não suporta 'in' com documentId() para múltiplos IDs facilmente
      const operatorsPromises = operatorIds.map(id => this.getOperatorById(id));
      const operators = await Promise.all(operatorsPromises);

      const validOperators = operators.filter(op => op !== null) as User[];

      console.log(`✅ ${validOperators.length} operador(es) encontrado(s)`);
      return validOperators;

    } catch (error) {
      console.error('❌ Erro ao buscar operadores por IDs:', error);
      return [];
    }
  }

  /**
   * 📋 Busca todos os operadores
   */
  async getAllOperators(includeDeleted: boolean = false): Promise<User[]> {
    try {
      console.log(`👥 Carregando todos os operadores`);

      const currentUser = this._sessionService.getSession();
      if (!currentUser) {
        console.log('❌ Usuário não está logado');
        return [];
      }

      let operatorsQuery;

      if (!includeDeleted) {
        operatorsQuery = query(
          this._usersCollection,
          where('deleted', '==', false),
          where('role', '==', 'operator'), // Filtra apenas operadores
          orderBy('name')
        );
      } else {
        operatorsQuery = query(
          this._usersCollection,
          where('role', '==', 'operator'), // Filtra apenas operadores
          orderBy('name')
        );
      }

      const querySnapshot = await getDocs(operatorsQuery);

      const operators = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data['name'] || 'Sem nome',
          email: data['email'] || '',
          phone: data['phone'] || '',
          roles: data['role'] || 'OPERATOR',
          created: data['created'],
          deleted: data['deleted'],
          username: data['username'],
          imageUrl: data['imageUrl'],
          isLoggedIn: data['isLoggedIn'],
          password: data['password'],
          ...data
        } as User;
      });

      console.log(`✅ Operadores carregados: ${operators.length} itens`);
      return operators;

    } catch (error) {
      console.error('❌ Erro ao carregar operadores:', error);
      return [];
    }
  }

  /**
   * 💾 Cria um novo operador
   */
  async createOperator(operatorData: Omit<User, 'id'>): Promise<User> {
    try {
      console.log('💾 Criando novo operador:', operatorData);

      const currentUser = this._sessionService.getSession();
      if (!currentUser) {
        throw new Error('Usuário não está logado');
      }

      const operatorToSave = {
        ...operatorData,
        role: 'OPERATOR', // Garante que é um operador
        created: new Date(),
        updated: null,
        deleted: false
      };

      const docRef = await addDoc(this._usersCollection, operatorToSave);

      const savedOperator: User = {
        ...operatorToSave,
        id: docRef.id
      };

      console.log('✅ Operador criado com sucesso:', savedOperator);
      return savedOperator;

    } catch (error) {
      console.error('❌ Erro ao criar operador:', error);
      throw error;
    }
  }

  /**
   * 📝 Atualiza um operador
   */
  async updateOperator(operatorId: string, operatorData: Partial<Omit<User, 'id'>>): Promise<User> {
    try {
      console.log('📝 Atualizando operador:', operatorId, operatorData);

      const currentUser = this._sessionService.getSession();
      if (!currentUser) {
        throw new Error('Usuário não está logado');
      }

      const updateData = {
        ...operatorData,
        updated: new Date().toISOString()
      };

      const operatorRef = doc(this._firestore, PATH_USERS, operatorId);
      await updateDoc(operatorRef, updateData);

      // Busca o operador atualizado
      const updatedOperator = await this.getOperatorById(operatorId);

      if (!updatedOperator) {
        throw new Error('Operador não encontrado após atualização');
      }

      console.log('✅ Operador atualizado:', updatedOperator);
      return updatedOperator;

    } catch (error) {
      console.error('❌ Erro ao atualizar operador:', error);
      throw error;
    }
  }

  /**
   * 🗑️ Exclui um operador (soft delete)
   */
  async deleteOperator(operatorId: string): Promise<boolean> {
    try {
      console.log('🗑️ Excluindo operador:', operatorId);

      const currentUser = this._sessionService.getSession();
      if (!currentUser) {
        throw new Error('Usuário não está logado');
      }

      const operatorRef = doc(this._firestore, PATH_USERS, operatorId);

      await updateDoc(operatorRef, {
        deleted: true,
        updated: new Date().toISOString()
      });

      console.log('✅ Operador marcado como excluído:', operatorId);
      return true;

    } catch (error) {
      console.error('❌ Erro ao excluir operador:', error);
      return false;
    }
  }
}