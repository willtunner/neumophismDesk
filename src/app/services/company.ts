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
  updateDoc,
  doc,
  getDoc,
  documentId
} from '@angular/fire/firestore';
import { SessionService } from './session.service';
import { Company, User } from '../models/models';

const PATH_COMPANIES = 'companies';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private _firestore = inject(Firestore);
  private _sessionService = inject(SessionService);

  // Signal para as empresas
  companies = signal<Company[]>([]);
  allCompanies = signal<Company[]>([]);

  constructor() {
    // Carrega as empresas iniciais se o usuário estiver logado
    this.loadAllCompanies(false);
  }

  // Getter lazy para a coleção de companies
  private get _companiesCollection(): CollectionReference {
    return collection(this._firestore, PATH_COMPANIES);
  }

  /**
   * Salva uma nova empresa
   * @param companyData Dados da empresa (sem id)
   * @returns Empresa salva com id e timestamps
   */
  async saveCompany(companyData: Omit<Company, 'id' | 'created' | 'updated'>): Promise<Company> {
    try {
      console.log('💾 Salvando nova empresa:', companyData);

      const currentUser = this._sessionService.getSession();
      if (!currentUser) {
        throw new Error('Usuário não está logado');
      }

      const companyToSave = {
        ...companyData,
        created: new Date().toISOString(),
        updated: null,
        deleted: false // Campo para soft delete
      };

      const docRef = await addDoc(this._companiesCollection, companyToSave);
      
      const savedCompany: Company = {
        ...companyToSave,
        id: docRef.id,
        updated: null
      };

      console.log('✅ Empresa salva com sucesso:', savedCompany);
      
      // Atualiza o signal
      this.companies.update(companies => [...companies, savedCompany]);
      
      return savedCompany;

    } catch (error) {
      console.error('❌ Erro ao salvar empresa:', error);
      throw error;
    }
  }

  /**
   * Exclui uma empresa (soft delete)
   * @param companyId ID da empresa
   * @returns boolean indicando sucesso
   */
  async deleteCompany(companyId: string): Promise<boolean> {
    try {
      console.log('🗑️ Excluindo empresa:', companyId);

      const currentUser = this._sessionService.getSession();
      if (!currentUser) {
        throw new Error('Usuário não está logado');
      }

      const companyRef = doc(this._firestore, PATH_COMPANIES, companyId);
      
      await updateDoc(companyRef, {
        deleted: true,
        updated: new Date().toISOString()
      });

      console.log('✅ Empresa marcada como excluída:', companyId);
      
      // Atualiza os signals
      this.companies.update(companies => 
        companies.filter(company => company.id !== companyId)
      );
      this.allCompanies.update(companies => 
        companies.map(company => 
          company.id === companyId 
            ? { ...company, deleted: true, updated: new Date().toISOString() }
            : company
        )
      );

      return true;

    } catch (error) {
      console.error('❌ Erro ao excluir empresa:', error);
      return false;
    }
  }

  /**
   * Atualiza uma empresa
   * @param companyId ID da empresa
   * @param companyData Dados atualizados
   * @returns Empresa atualizada
   */
  async updateCompany(companyId: string, companyData: Partial<Omit<Company, 'id' | 'created' | 'updated'>>): Promise<Company> {
    try {
      console.log('📝 Atualizando empresa:', companyId, companyData);

      const currentUser = this._sessionService.getSession();
      if (!currentUser) {
        throw new Error('Usuário não está logado');
      }

      const updateData = {
        ...companyData,
        updated: new Date().toISOString()
      };

      const companyRef = doc(this._firestore, PATH_COMPANIES, companyId);
      await updateDoc(companyRef, updateData);

      // Busca a empresa atualizada
      const updatedCompany = await this.getCompanyById(companyId);
      
      if (!updatedCompany) {
        throw new Error('Empresa não encontrada após atualização');
      }

      console.log('✅ Empresa atualizada:', updatedCompany);
      
      // Atualiza os signals
      this.companies.update(companies => 
        companies.map(company => 
          company.id === companyId ? updatedCompany : company
        )
      );
      this.allCompanies.update(companies => 
        companies.map(company => 
          company.id === companyId ? updatedCompany : company
        )
      );

      return updatedCompany;

    } catch (error) {
      console.error('❌ Erro ao atualizar empresa:', error);
      throw error;
    }
  }

  /**
   * Busca empresa por ID
   * @param companyId ID da empresa
   * @returns Empresa encontrada ou null
   */
  async getCompanyById(companyId: string): Promise<Company | null> {
    try {
      const companyRef = doc(this._firestore, PATH_COMPANIES, companyId);
      const companySnap = await getDoc(companyRef);

      if (companySnap.exists()) {
        const data = companySnap.data();
        const company: Company = {
          id: companySnap.id,
          name: data['name'],
          keywords: data['keywords'] || [],
          created: data['created'],
          updated: data['updated'],
          cnpj: data['cnpj'],
          city: data['city'],
          state: data['state'],
          address: data['address'],
          zipcode: data['zipcode'],
          phone: data['phone'],
          connectionServ: data['connectionServ'],
          email: data['email'],
          versionServ: data['versionServ'],
          clientsId: data['clientsId'] || []
        };
        return company;
      }

      return null;

    } catch (error) {
      console.error('❌ Erro ao buscar empresa por ID:', error);
      return null;
    }
  }

  /**
 * Busca todas as empresas
 * @param includeDeleted Flag para incluir empresas excluídas
 * @param companyIds Array opcional de IDs específicos
 * @returns Array de empresas
 */
async loadAllCompanies(
  includeDeleted: boolean = false,
  companyIds?: string[]
): Promise<Company[]> {
  try {
    console.log(`🏢 Carregando empresas - includeDeleted: ${includeDeleted}, IDs:`, companyIds);

    const currentUser = this._sessionService.getSession();
    if (!currentUser) {
      console.log('❌ Usuário não está logado');
      return [];
    }

    let companiesQuery;

    if (companyIds && companyIds.length > 0) {
      // Busca por IDs específicos
      companiesQuery = query(
        this._companiesCollection,
        where(documentId(), 'in', companyIds.slice(0, 10)) // Firestore limita a 10 IDs por query
      );
    } else if (!includeDeleted) {
      // Busca somente empresas não excluídas
      companiesQuery = query(
        this._companiesCollection,
        where('deleted', '==', false),
        orderBy('created', 'desc')
      );
    } else {
      // Busca todas as empresas (incluindo excluídas)
      companiesQuery = query(
        this._companiesCollection,
        orderBy('created', 'desc')
      );
    }

    const querySnapshot = await getDocs(companiesQuery);
    
    const companies = querySnapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data['name'],
          keywords: data['keywords'] || [],
          created: data['created'],
          updated: data['updated'],
          cnpj: data['cnpj'],
          city: data['city'],
          state: data['state'],
          address: data['address'],
          zipcode: data['zipcode'],
          phone: data['phone'],
          connectionServ: data['connectionServ'],
          email: data['email'],
          versionServ: data['versionServ'],
          clientsId: data['clientsId'] || [],
          deleted: data['deleted'] || false
        } as Company & { deleted?: boolean };
      })
      .filter(company => includeDeleted || !company.deleted)
      .map(company => {
        // Remove o campo deleted do objeto final
        const { deleted, ...companyWithoutDeleted } = company;
        return companyWithoutDeleted as Company;
      });

    console.log(`✅ Empresas carregadas: ${companies.length} itens`);

    // Atualiza os signals
    if (!includeDeleted) {
      this.companies.set(companies);
    }
    this.allCompanies.set(companies);

    return companies;

  } catch (error) {
    console.error('❌ Erro ao carregar empresas:', error);
    return [];
  }
}

  /**
   * Busca empresas por nome ou keywords
   * @param searchTerm Termo de busca
   * @param includeDeleted Flag para incluir empresas excluídas
   * @returns Array de empresas encontradas
   */
  async searchCompaniesByName(
    searchTerm: string,
    includeDeleted: boolean = false
  ): Promise<Company[]> {
    try {
      console.log(`🔍 Buscando empresas por: "${searchTerm}" - includeDeleted: ${includeDeleted}`);

      const currentUser = this._sessionService.getSession();
      if (!currentUser) {
        console.log('❌ Usuário não está logado');
        return [];
      }

      // Primeiro, carrega todas as empresas
      const  allCompanies = await this.loadAllCompanies(includeDeleted);
      
      // Filtra localmente por nome ou keywords
      const searchTermLower = searchTerm.toLowerCase();
      
      const filteredCompanies = allCompanies.filter(company => {
        const nameMatch = company.name.toLowerCase().includes(searchTermLower);
        const keywordMatch = company.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchTermLower)
        );
        
        return nameMatch || keywordMatch;
      });

      console.log(`✅ Empresas encontradas: ${filteredCompanies.length} itens`);
      
      return filteredCompanies;

    } catch (error) {
      console.error('❌ Erro ao buscar empresas por nome:', error);
      return [];
    }
  }

  /**
   * Busca empresas com filtro otimizado para grandes volumes
   * @param searchTerm Termo de busca
   * @param includeDeleted Flag para incluir empresas excluídas
   * @returns Array de empresas encontradas
   */
  async searchCompaniesOptimized(
    searchTerm: string,
    includeDeleted: boolean = false
  ): Promise<Company[]> {
    try {
      console.log(`🔍 Buscando empresas (otimizado) por: "${searchTerm}"`);

      const currentUser = this._sessionService.getSession();
      if (!currentUser) {
        console.log('❌ Usuário não está logado');
        return [];
      }

      let companiesQuery;

      if (!includeDeleted) {
        companiesQuery = query(
          this._companiesCollection,
          where('deleted', '==', false),
          orderBy('name')
        );
      } else {
        companiesQuery = query(
          this._companiesCollection,
          orderBy('name')
        );
      }

      const querySnapshot = await getDocs(companiesQuery);
      
      const searchTermLower = searchTerm.toLowerCase();
      
      const filteredCompanies = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data['name'],
            keywords: data['keywords'] || [],
            created: data['created'],
            updated: data['updated'],
            cnpj: data['cnpj'],
            city: data['city'],
            state: data['state'],
            address: data['address'],
            zipcode: data['zipcode'],
            phone: data['phone'],
            connectionServ: data['connectionServ'],
            email: data['email'],
            versionServ: data['versionServ'],
            clientsId: data['clientsId'] || []
          } as Company;
        })
        .filter(company => {
          const nameMatch = company.name.toLowerCase().includes(searchTermLower);
          const keywordMatch = company.keywords.some(keyword => 
            keyword.toLowerCase().includes(searchTermLower)
          );
          
          return nameMatch || keywordMatch;
        });

      console.log(`✅ Empresas encontradas (otimizado): ${filteredCompanies.length} itens`);
      
      return filteredCompanies;

    } catch (error) {
      console.error('❌ Erro na busca otimizada de empresas:', error);
      return [];
    }
  }

  /**
   * Obtém o número total de empresas
   * @param includeDeleted Flag para incluir empresas excluídas
   */
  getCompaniesCount(includeDeleted: boolean = false): number {
    const companies = includeDeleted ? this.allCompanies() : this.companies();
    return companies.length;
  }

  /**
   * Limpa os signals (útil para logout)
   */
  clearCompanies(): void {
    this.companies.set([]);
    this.allCompanies.set([]);
    console.log('🧹 Signals de empresas limpos');
  }
}



/*
* Buscar empresas não excluídas
const companies = await this.companyService.loadAllCompanies(false);

* Buscar todas as empresas (incluindo excluídas)
const allCompanies = await this.companyService.loadAllCompanies(true);

* Buscar empresas por IDs específicos
const specificCompanies = await this.companyService.loadAllCompanies(false, ['id1', 'id2', 'id3']);

* Buscar empresas excluídas por IDs
const deletedCompanies = await this.companyService.loadAllCompanies(true, ['id4', 'id5']);

*/