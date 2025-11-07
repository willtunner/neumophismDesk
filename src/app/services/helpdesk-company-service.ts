import { inject, Injectable, signal } from '@angular/core';
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
  orderBy,
  where,
  deleteDoc,
  arrayRemove,
  arrayUnion
} from '@angular/fire/firestore';
import { HelpDeskCompany, User } from '../models/models';

const PATH_HELPDESK_COMPANIES = 'helpdeskCompanies';
const PATH_USERS = 'users'; // Coleção para funcionários

@Injectable({
  providedIn: 'root',
})
export class HelpdeskCompanyService {
  private _firestore = inject(Firestore);

  // Signal para armazenar a última empresa criada
  private lastCreatedCompany = signal<HelpDeskCompany | null>(null);

  // 🔹 Getter da coleção principal
  private get _helpdeskCompaniesCollection(): CollectionReference {
    return collection(this._firestore, PATH_HELPDESK_COMPANIES);
  }

  // 🔹 Getter da coleção de usuários (funcionários)
  private get _usersCollection(): CollectionReference {
    return collection(this._firestore, PATH_USERS);
  }

  /**
   * Armazena a última empresa criada
   */
  setLastCreatedCompany(company: HelpDeskCompany): void {
    this.lastCreatedCompany.set(company);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastCreatedCompany', JSON.stringify(company));
    }
  }

  /**
   * Obtém a última empresa criada
   */
  getLastCreatedCompany(): HelpDeskCompany | null {
    const company = this.lastCreatedCompany();
    if (company) {
      return company;
    }
    
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lastCreatedCompany');
      if (stored) {
        return JSON.parse(stored);
      }
    }
    
    return null;
  }

  /**
   * Limpa a última empresa criada
   */
  clearLastCreatedCompany(): void {
    this.lastCreatedCompany.set(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lastCreatedCompany');
    }
  }

  // ========== MÉTODOS PARA FUNCIONÁRIOS (EMPLOYEES) ==========

  /**
   * 💾 Salva um funcionário e atualiza a empresa
   */
  async saveEmployee(employeeData: Omit<User, 'id' | 'created' | 'updated'>, helpDeskCompany: HelpDeskCompany): Promise<User> {
    try {
      console.log('💾 Salvando funcionário:', employeeData);

      const now = new Date();

      // Prepara os dados do funcionário
      const newEmployee = {
        ...employeeData,
        created: now,
        updated: null,
        deleted: false,
        helpDeskCompanyId: helpDeskCompany.id // Garante que tem o ID da empresa
      };

      // Salva o funcionário na coleção 'users'
      const docRef = await addDoc(this._usersCollection, newEmployee);

      // Cria o objeto User completo com o ID gerado
      const createdEmployee: User = {
        id: docRef.id,
        ...newEmployee
      };

      console.log('✅ Funcionário salvo com ID:', docRef.id);

      // 🔹 ATUALIZA A EMPRESA COM O NOVO FUNCIONÁRIO
      await this.addEmployeeToCompany(helpDeskCompany.id!, docRef.id);

      return createdEmployee;

    } catch (error) {
      console.error('❌ Erro ao salvar funcionário:', error);
      throw error;
    }
  }

  /**
   * 🔄 Atualiza um funcionário existente
   */
  async updateEmployee(employeeId: string, employeeData: Partial<Omit<User, 'id' | 'created' | 'helpDeskCompanyId'>>): Promise<User> {
    try {
      console.log('📝 Atualizando funcionário:', employeeId, employeeData);

      const updateData = {
        ...employeeData,
        updated: new Date()
      };

      // Atualiza o funcionário no Firestore
      const employeeRef = doc(this._firestore, PATH_USERS, employeeId);
      await updateDoc(employeeRef, updateData);

      // Busca o funcionário atualizado
      const updatedEmployee = await this.getEmployeeById(employeeId);

      if (!updatedEmployee) {
        throw new Error('Funcionário não encontrado após atualização');
      }

      console.log('✅ Funcionário atualizado:', updatedEmployee);
      return updatedEmployee;

    } catch (error) {
      console.error('❌ Erro ao atualizar funcionário:', error);
      throw error;
    }
  }

  /**
   * 🗑️ Exclui um funcionário (marca como deletado)
   */
  async deleteEmployee(employeeId: string, helpDeskCompanyId: string): Promise<boolean> {
    try {
      console.log('🗑️ Excluindo funcionário:', employeeId);

      // Atualiza o funcionário marcando como deletado
      const employeeRef = doc(this._firestore, PATH_USERS, employeeId);
      await updateDoc(employeeRef, {
        deleted: true,
        updated: new Date()
      });

      // 🔹 REMOVE O FUNCIONÁRIO DA EMPRESA
      await this.removeEmployeeFromCompany(helpDeskCompanyId, employeeId);

      console.log('✅ Funcionário marcado como excluído:', employeeId);
      return true;

    } catch (error) {
      console.error('❌ Erro ao excluir funcionário:', error);
      return false;
    }
  }

  /**
   * 🔍 Busca funcionário por ID
   */
  async getEmployeeById(employeeId: string): Promise<User | null> {
    try {
      console.log('🔍 Buscando funcionário por ID:', employeeId);

      const employeeRef = doc(this._firestore, PATH_USERS, employeeId);
      const employeeSnap = await getDoc(employeeRef);

      if (employeeSnap.exists()) {
        const data = employeeSnap.data();
        const employee: User = {
          id: employeeSnap.id,
          name: data['name'],
          email: data['email'],
          phone: data['phone'],
          username: data['username'],
          password: data['password'],
          imageUrl: data['imageUrl'],
          connection: data['connection'],
          roles: data['roles'],
          deleted: data['deleted'] || false,
          created: data['created']?.toDate?.() || new Date(data['created'] || Date.now()),
          updated: data['updated']?.toDate?.() || new Date(data['updated'] || Date.now()),
          isLoggedIn: data['isLoggedIn'] || false,
          helpDeskCompanyId: data['helpDeskCompanyId'],
          companyId: data['companyId']
        };
        return employee;
      }

      return null;

    } catch (error) {
      console.error('❌ Erro ao buscar funcionário por ID:', error);
      return null;
    }
  }

  /**
   * 🔍 Busca funcionários por empresa HelpDesk
   */
  async getEmployeesByHelpDeskCompany(helpDeskCompanyId: string): Promise<User[]> {
    try {
      console.log('👥 Buscando funcionários da empresa:', helpDeskCompanyId);

      const employeesQuery = query(
        this._usersCollection,
        where('helpDeskCompanyId', '==', helpDeskCompanyId),
        where('deleted', '==', false),
        orderBy('name', 'asc')
      );

      const querySnapshot = await getDocs(employeesQuery);
      
      const employees = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const employee: User = {
          id: doc.id,
          name: data['name'],
          email: data['email'],
          phone: data['phone'],
          username: data['username'],
          password: data['password'],
          imageUrl: data['imageUrl'],
          connection: data['connection'],
          roles: data['roles'],
          deleted: data['deleted'] || false,
          created: data['created']?.toDate?.() || new Date(data['created'] || Date.now()),
          updated: data['updated']?.toDate?.() || new Date(data['updated'] || Date.now()),
          isLoggedIn: data['isLoggedIn'] || false,
          helpDeskCompanyId: data['helpDeskCompanyId'],
          companyId: data['companyId']
        };
        return employee;
      });

      console.log(`✅ ${employees.length} funcionário(s) encontrado(s) para a empresa ${helpDeskCompanyId}`);
      return employees;

    } catch (error) {
      console.error('❌ Erro ao buscar funcionários por empresa:', error);
      return [];
    }
  }

  /**
   * 🔍 Busca todos os funcionários
   */
  async getAllEmployees(): Promise<User[]> {
    try {
      console.log('👥 Carregando todos os funcionários');

      const employeesQuery = query(
        this._usersCollection,
        where('deleted', '==', false),
        orderBy('name', 'asc')
      );

      const querySnapshot = await getDocs(employeesQuery);
      
      const employees = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const employee: User = {
          id: doc.id,
          name: data['name'],
          email: data['email'],
          phone: data['phone'],
          username: data['username'],
          password: data['password'],
          imageUrl: data['imageUrl'],
          connection: data['connection'],
          roles: data['roles'],
          deleted: data['deleted'] || false,
          created: data['created']?.toDate?.() || new Date(data['created'] || Date.now()),
          updated: data['updated']?.toDate?.() || new Date(data['updated'] || Date.now()),
          isLoggedIn: data['isLoggedIn'] || false,
          helpDeskCompanyId: data['helpDeskCompanyId'],
          companyId: data['companyId']
        };
        return employee;
      });

      console.log(`✅ Todos os funcionários carregados: ${employees.length} itens`);
      return employees;

    } catch (error) {
      console.error('❌ Erro ao carregar todos os funcionários:', error);
      return [];
    }
  }

  // ========== MÉTODOS AUXILIARES PARA EMPRESA ==========

  /**
   * ➕ Adiciona funcionário à empresa
   */
  private async addEmployeeToCompany(companyId: string, employeeId: string): Promise<void> {
    try {
      console.log(`🏢 Adicionando funcionário ${employeeId} à empresa ${companyId}`);

      const companyRef = doc(this._firestore, PATH_HELPDESK_COMPANIES, companyId);
      
      await updateDoc(companyRef, {
        employeesId: arrayUnion(employeeId),
        updated: new Date()
      });

      console.log(`✅ Funcionário ${employeeId} adicionado à empresa ${companyId}`);

    } catch (error) {
      console.error(`❌ Erro ao adicionar funcionário à empresa ${companyId}:`, error);
      throw error;
    }
  }

  /**
   * ➖ Remove funcionário da empresa
   */
  private async removeEmployeeFromCompany(companyId: string, employeeId: string): Promise<void> {
    try {
      console.log(`🏢 Removendo funcionário ${employeeId} da empresa ${companyId}`);

      const companyRef = doc(this._firestore, PATH_HELPDESK_COMPANIES, companyId);
      
      await updateDoc(companyRef, {
        employeesId: arrayRemove(employeeId),
        updated: new Date()
      });

      console.log(`✅ Funcionário ${employeeId} removido da empresa ${companyId}`);

    } catch (error) {
      console.error(`❌ Erro ao remover funcionário da empresa ${companyId}:`, error);
      throw error;
    }
  }

  // ========== MÉTODOS EXISTENTES PARA EMPRESA ==========

  /**
   * 💾 Cria ou atualiza uma empresa Helpdesk
   */
  async saveHelpdeskCompany(data: HelpDeskCompany): Promise<HelpDeskCompany> {
    try {
      const now = new Date();

      // 🟢 Novo registro
      if (!data.id) {
        const newCompany: Omit<HelpDeskCompany, 'id'> = {
          ...data,
          created: now,
          updated: now,
          keywords: this.generateKeywords(data.name),
          active: data.active ?? true,
        };

        const docRef = await addDoc(this._helpdeskCompaniesCollection, newCompany);
        await updateDoc(docRef, { id: docRef.id });

        const createdCompany: HelpDeskCompany = {
          id: docRef.id,
          ...newCompany,
        };

        console.log('✅ HelpDeskCompany criada com sucesso:', createdCompany);
        return createdCompany;
      }

      // 🟢 Atualização existente
      const docRef = doc(this._helpdeskCompaniesCollection, data.id);
      const updatePayload = {
        ...data,
        updated: now,
        keywords: this.generateKeywords(data.name),
      };

      await updateDoc(docRef, updatePayload);

      const updatedCompany: HelpDeskCompany = {
        ...updatePayload,
      };

      console.log('✅ HelpDeskCompany atualizada:', updatedCompany);
      return updatedCompany;

    } catch (error) {
      console.error('❌ Erro ao salvar HelpDeskCompany:', error);
      throw error;
    }
  }

  /**
   * 🔍 Busca todas as empresas Helpdesk
   */
  async getAllHelpdeskCompanies(): Promise<HelpDeskCompany[]> {
    try {
      const q = query(this._helpdeskCompaniesCollection, orderBy('created', 'desc'));
      const snapshot = await getDocs(q);
      const companies = snapshot.docs.map(doc =>
        this.mapFirestoreDataToHelpdeskCompany(doc.id, doc.data())
      );
      console.log(`📋 ${companies.length} HelpDeskCompanies carregadas`);
      return companies;
    } catch (error) {
      console.error('❌ Erro ao buscar empresas HelpDesk:', error);
      return [];
    }
  }

  /**
   * 🔍 Busca por ID
   */
  async getHelpdeskCompanyById(id: string): Promise<HelpDeskCompany | null> {
    if (!id) return null;
    try {
      const docRef = doc(this._helpdeskCompaniesCollection, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.warn('⚠️ Empresa HelpDesk não encontrada:', id);
        return null;
      }
      return this.mapFirestoreDataToHelpdeskCompany(docSnap.id, docSnap.data());
    } catch (error) {
      console.error('❌ Erro ao buscar empresa HelpDesk:', error);
      return null;
    }
  }

  /**
   * 🔍 Busca múltiplas empresas por ID
   */
  async getHelpdeskCompaniesByIds(ids: string[]): Promise<HelpDeskCompany[]> {
    if (!ids || ids.length === 0) return [];
    try {
      const uniqueIds = [...new Set(ids.filter(Boolean))];
      const promises = uniqueIds.map(id => this.getHelpdeskCompanyById(id));
      const results = await Promise.all(promises);
      return results.filter((c): c is HelpDeskCompany => c !== null);
    } catch (error) {
      console.error('❌ Erro ao buscar múltiplas empresas HelpDesk:', error);
      return [];
    }
  }

  /**
   * 🗺️ Converte dados Firestore → modelo HelpDeskCompany
   */
  private mapFirestoreDataToHelpdeskCompany(id: string, data: any): HelpDeskCompany {
    const created = data['created']?.toDate?.() || new Date(data['created'] || Date.now());
    const updated = data['updated']?.toDate?.() || new Date(data['updated'] || Date.now());

    return {
      id,
      name: data['name'] || '',
      keywords: data['keywords'] || [],
      created,
      updated,
      cnpj: data['cnpj'] || 0,
      city: data['city'] || '',
      state: data['state'] || '',
      address: data['address'] || '',
      neighborhood: data['neighborhood'] || '',
      zipcode: data['zipcode'] || 0,
      phone: data['phone'] || 0,
      email: data['email'] || '',
      companiesId: data['companiesId'] || [],
      employeesId: data['employeesId'] || [],
      roles: data['roles'] || [],
      active: data['active'] ?? true,
    };
  }

  /**
   * 🧩 Gera keywords a partir do nome
   */
  private generateKeywords(name: string): string[] {
    if (!name) return [];
    const clean = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const words = clean.split(/\s+/);
    const keywords: string[] = [...words];
    if (words.length > 1) {
      keywords.push(words.join(' '));
    }
    return keywords;
  }
}