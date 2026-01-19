import { inject, Injectable, signal } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  CollectionReference,
  doc,
  getDoc,
} from '@angular/fire/firestore';
import { User, Client, HelpDeskCompany, Company } from '../models/models';
import { SessionService } from './session.service';

const PATH_USERS = 'users';
const PATH_CLIENTS = 'clients';
const PATH_HELPDESKS_COMPANIES = 'helpdeskCompanies';
const PATH_COMPANIES = 'companies';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _firestore = inject(Firestore);
  private _sessionService = inject(SessionService);

  // Signal para o estado de autenticação e usuário logado
  loggedIn = signal(false);
  currentUser = signal<User | null>(null);

  constructor() {
    const session = this._sessionService.getSession();
    if (session) {
      this.loggedIn.set(true);
      this.currentUser.set(session);
      // Popula os dados relacionados quando inicializa com sessão existente
      this.populateUserRelations(session);
    } else {
      this.loggedIn.set(false);
      this.currentUser.set(null);
    }
  }

  // Getters lazy para as coleções
  private get _usersCollection(): CollectionReference {
    return collection(this._firestore, PATH_USERS);
  }

  private get _clientsCollection(): CollectionReference {
    return collection(this._firestore, PATH_CLIENTS);
  }

  private get _helpDeskCompaniesCollection(): CollectionReference {
    return collection(this._firestore, PATH_HELPDESKS_COMPANIES);
  }

  private get _companiesCollection(): CollectionReference {
    return collection(this._firestore, PATH_COMPANIES);
  }

  /**
   * Função principal para popular relações do usuário
   * Busca company, helpDeskCompany e outros dados relacionados baseado nos IDs
   */
  async populateUserRelations(userData: User | Client): Promise<User | Client> {
    try {
      console.log('🔄 Iniciando população de relações para usuário:', userData.id);

      const populatedUser = { ...userData };

      // Buscar Company se existir companyId
      if (populatedUser.companyId) {
        console.log('🏢 Buscando company com ID:', populatedUser.companyId);
        populatedUser.company = await this.getCompanyById(populatedUser.companyId);
      }

      // Buscar HelpDeskCompany se existir helpDeskCompanyId
      if ((populatedUser as User).helpDeskCompanyId) {
        console.log('🏢 Buscando helpDeskCompany com ID:', (populatedUser as User).helpDeskCompanyId);
        (populatedUser as User).helpDeskCompany = await this.getHelpDeskCompanyById((populatedUser as User).helpDeskCompanyId!);
      }

      // Se for um Client, buscar company relacionada
      if ((populatedUser as Client).companyId && !populatedUser.company) {
        console.log('🏢 Buscando company para client com ID:', (populatedUser as Client).companyId);
        populatedUser.company = await this.getCompanyById((populatedUser as Client).companyId);
      }

      console.log('✅ População de relações concluída:', populatedUser);
      return populatedUser;

    } catch (error) {
      console.error('❌ Erro ao popular relações do usuário:', error);
      return userData; // Retorna os dados originais em caso de erro
    }
  }

  /**
   * Busca uma Company pelo ID
   */
  private async getCompanyById(companyId: string): Promise<Company | null> {
    try {
      const companyDoc = doc(this._companiesCollection, companyId);
      const companySnapshot = await getDoc(companyDoc);
      
      if (companySnapshot.exists()) {
        const companyData = companySnapshot.data() as Company;
        return { ...companyData, id: companySnapshot.id };
      }
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar company:', error);
      return null;
    }
  }

  /**
   * Busca uma HelpDeskCompany pelo ID
   */
  private async getHelpDeskCompanyById(helpDeskCompanyId: string): Promise<HelpDeskCompany | null> {
    try {
      const helpDeskCompanyDoc = doc(this._helpDeskCompaniesCollection, helpDeskCompanyId);
      const helpDeskCompanySnapshot = await getDoc(helpDeskCompanyDoc);
      
      if (helpDeskCompanySnapshot.exists()) {
        const helpDeskCompanyData = helpDeskCompanySnapshot.data() as HelpDeskCompany;
        
        // Buscar companies relacionadas se existirem
        if (helpDeskCompanyData.companiesId && helpDeskCompanyData.companiesId.length > 0) {
          console.log('🏢 Buscando companies relacionadas à helpDeskCompany:', helpDeskCompanyData.companiesId);
          helpDeskCompanyData.companies = await this.getCompaniesByIds(helpDeskCompanyData.companiesId);
        }

        // Buscar employees relacionados se existirem
        if (helpDeskCompanyData.employeesId && helpDeskCompanyData.employeesId.length > 0) {
          console.log('👥 Buscando employees relacionados à helpDeskCompany:', helpDeskCompanyData.employeesId);
          helpDeskCompanyData.employees = await this.getUsersByIds(helpDeskCompanyData.employeesId);
        }

        return { ...helpDeskCompanyData, id: helpDeskCompanySnapshot.id };
      }
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar helpDeskCompany:', error);
      return null;
    }
  }

  /**
   * Busca múltiplas Companies por IDs
   */
  private async getCompaniesByIds(companyIds: string[]): Promise<Company[]> {
    try {
      const companies: Company[] = [];
      
      for (const companyId of companyIds) {
        const company = await this.getCompanyById(companyId);
        if (company) {
          companies.push(company);
        }
      }
      
      return companies;
    } catch (error) {
      console.error('❌ Erro ao buscar companies por IDs:', error);
      return [];
    }
  }

  /**
   * Busca múltiplos Users por IDs
   */
  private async getUsersByIds(userIds: string[]): Promise<User[]> {
    try {
      const users: User[] = [];
      
      for (const userId of userIds) {
        const userDoc = doc(this._usersCollection, userId);
        const userSnapshot = await getDoc(userDoc);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data() as User;
          users.push({ ...userData, id: userSnapshot.id });
        }
      }
      
      return users;
    } catch (error) {
      console.error('❌ Erro ao buscar users por IDs:', error);
      return [];
    }
  }

  /**
   * Função genérica para popular qualquer objeto que tenha companyId ou helpDeskCompanyId
   */
  async populateObjectRelations<T extends { companyId?: string; helpDeskCompanyId?: string }>(
    obj: T
  ): Promise<T & { company?: Company | null; helpDeskCompany?: HelpDeskCompany | null }> {
    try {
      const populatedObj = { ...obj } as T & { company?: Company | null; helpDeskCompany?: HelpDeskCompany | null };

      // Buscar Company se existir companyId
      if (populatedObj.companyId) {
        console.log('🏢 Buscando company com ID:', populatedObj.companyId);
        populatedObj.company = await this.getCompanyById(populatedObj.companyId);
      }

      // Buscar HelpDeskCompany se existir helpDeskCompanyId
      if (populatedObj.helpDeskCompanyId) {
        console.log('🏢 Buscando helpDeskCompany com ID:', populatedObj.helpDeskCompanyId);
        populatedObj.helpDeskCompany = await this.getHelpDeskCompanyById(populatedObj.helpDeskCompanyId);
      }

      console.log('✅ População de relações do objeto concluída:', populatedObj);
      return populatedObj;

    } catch (error) {
      console.error('❌ Erro ao popular relações do objeto:', error);
      return obj as T & { company?: Company | null; helpDeskCompany?: HelpDeskCompany | null };
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    console.log('🚀 Tentativa de login iniciada', { email, password });

    await this._debugCollections();

    try {
      // 🔍 Buscar apenas por EMAIL normalizado nas 3 coleções
      const usersEmailQuery = query(this._usersCollection, where('email', '==', email));
      const clientsEmailQuery = query(this._clientsCollection, where('email', '==', email));
      const helpCompaniesEmailQuery = query(this._helpDeskCompaniesCollection, where('email', '==', email));

      // Executa as consultas em paralelo
      const [usersSnap, clientsSnap, helpCompaniesSnap] = await Promise.all([
        getDocs(usersEmailQuery),
        getDocs(clientsEmailQuery),
        getDocs(helpCompaniesEmailQuery),
      ]);

      console.log('📊 Resultados encontrados:');
      console.log('➡️ Users:', usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      console.log('➡️ Clients:', clientsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      console.log('➡️ HelpCompanies:', helpCompaniesSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const totalEmailMatches = usersSnap.size + clientsSnap.size + helpCompaniesSnap.size;

      // 📌 Caso tenha mais de um email encontrado
      if (totalEmailMatches > 1) {
        throw new Error('E-mail duplicado encontrado em mais de uma conta (users/clients/helpCompanies).');
      }

      // 📌 Nenhum email encontrado
      if (totalEmailMatches === 0) {
        throw new Error('E-mail não existe.');
      }

      // 📌 Email encontrado em apenas UMA coleção
      let userDoc: any = null;
      let source = '';

      if (!usersSnap.empty) {
        userDoc = usersSnap.docs[0];
        source = 'users';
      } else if (!clientsSnap.empty) {
        userDoc = clientsSnap.docs[0];
        source = 'clients';
      } else if (!helpCompaniesSnap.empty) {
        userDoc = helpCompaniesSnap.docs[0];
        source = 'helpCompanies';
      }

      const user = userDoc.data() as User;
      user.id = userDoc.id;

      console.log(`✅ Usuário encontrado na coleção: ${source}`, user);

      // 📌 Valida senha
      if (user.password !== password) {
        throw new Error('Senha incorreta.');
      }

      // ✅ Popula as relações antes de salvar a sessão
      console.log('🔄 Populando relações do usuário...');
      const populatedUser = await this.populateUserRelations(user);

      // ✅ Login bem-sucedido
      this._saveSession(populatedUser);
      return true;

    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  }

  // Só para debug - pega todos os docs da coleção
  private async _debugCollections() {
    const users = await getDocs(this._usersCollection);
    console.log('🔥 users:', users.docs.map(d => ({ id: d.id, ...d.data() })));

    const clients = await getDocs(this._clientsCollection);
    console.log('🔥 clients:', clients.docs.map(d => ({ id: d.id, ...d.data() })));

    const helpCompanies = await getDocs(this._helpDeskCompaniesCollection);
    console.log('🔥 helpCompanies:', helpCompanies.docs.map(d => ({ id: d.id, ...d.data() })));

    const companies = await getDocs(this._companiesCollection);
    console.log('🔥 companies:', companies.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  private _saveSession(user: User | Client) {
    this._sessionService.setSession(user);
    this.loggedIn.set(true);
    this.currentUser.set(user as User);
  }

  logout(): void {
    this._sessionService.clearSession();
    this.loggedIn.set(false);
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return this.loggedIn();
  }

  /**
   * Método público para atualizar o currentUser com dados populados
   * Útil para quando os dados são atualizados em outras partes do sistema
   */
  async refreshCurrentUser(): Promise<void> {
    const currentUser = this.currentUser();
    if (currentUser) {
      const populatedUser = await this.populateUserRelations(currentUser);
      this.currentUser.set(populatedUser as User);
      this._sessionService.setSession(populatedUser);
    }
  }

  /**
   * Método para buscar um usuário por ID e popular suas relações
   */
  async getUserById(userId: string, collectionType: 'users' | 'clients' = 'users'): Promise<User | Client | null> {
    try {
      let userDoc;
      
      if (collectionType === 'users') {
        userDoc = doc(this._usersCollection, userId);
      } else {
        userDoc = doc(this._clientsCollection, userId);
      }

      const userSnapshot = await getDoc(userDoc);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data() as User | Client;
        userData.id = userSnapshot.id;
        
        // Popula as relações
        return await this.populateUserRelations(userData);
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar usuário por ID:', error);
      return null;
    }
  }
}