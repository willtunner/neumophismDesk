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
import { NotificationService } from './notification';
import { NotificationTitle, NotificationType } from '../enuns/notification-icon-types.enum';

const PATH_COMPANIES = 'companies';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private _firestore = inject(Firestore);
  private _sessionService = inject(SessionService);
  private notificationService = inject(NotificationService);

  // Signal para as empresas
  companies = signal<Company[]>([]);
  allCompanies = signal<Company[]>([]);
  userLogged: User = this._sessionService.getSession()!;

  constructor() {

  }

  // Getter lazy para a coleção de companies
  private get _companiesCollection(): CollectionReference {
    return collection(this._firestore, PATH_COMPANIES);
  }

  async loadAllCompanies(): Promise<Company[]> {
    try {
      console.log('🏢 Buscando empresas com helpDeskCompanyId:', this.userLogged.helpDeskCompanyId);

      // Verifica se o usuário tem helpDeskCompanyId
      if (!this.userLogged.helpDeskCompanyId) {
        console.log('❌ Usuário não possui helpDeskCompanyId');
        return [];
      }

      // Cria a query para buscar empresas com o mesmo helpDeskCompanyId e deleted = false
      const companiesQuery = query(
        this._companiesCollection,
        where('helpDeskCompanyId', '==', this.userLogged.helpDeskCompanyId),
        where('deleted', '==', false),
        orderBy('created', 'desc') // Ordena por data de criação decrescente
      );

      // Executa a query
      const querySnapshot = await getDocs(companiesQuery);

      // Mapeia os documentos para objetos Company
      const companies = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const company: Company = {
          id: doc.id,
          name: data['name'],
          keywords: data['keywords'] || [],
          deleted: data['deleted'] || false,
          created: data['created'] || new Date(), // Converte Firestore Timestamp para Date
          updated: data['updated'] || null, // Converte Firestore Timestamp para Date ou null
          cnpj: data['cnpj'],
          city: data['city'],
          state: data['state'],
          address: data['address'],
          zipcode: data['zipcode'],
          phone: data['phone'],
          connectionServ: data['connectionServ'],
          email: data['email'],
          versionServ: data['versionServ'] || null,
          clientsId: data['clientsId'] || [],
          helpDeskCompanyId: data['helpDeskCompanyId']
        };
        return company;
      });



      // Atualiza o signal com as empresas encontradas
      this.companies.set(companies);
      // Exibe detalhes de cada empresa no console
      console.log('empresas emcontradas: ', this.companies);

      return companies;

    } catch (error) {
      console.error('❌ Erro ao buscar empresas por helpDeskCompanyId:', error);
      return [];
    }
  }

  async saveCompany(companyData: Omit<Company, 'id' | 'created' | 'updated'>): Promise<Company> {
    try {
      console.log('💾 Salvando empresa:', companyData);

      const currentUser = this._sessionService.getSession();
      if (!currentUser) {
        throw new Error('Usuário não está logado');
      }

      const now = new Date();

      // Prepara os dados da nova empresa
      const newCompany = {
        ...companyData,
        helpDeskCompanyId: this.userLogged.helpDeskCompanyId,
        deleted: false,
        created: now,
        updated: null
      };

      // Adiciona a empresa no Firestore
      const docRef = await addDoc(this._companiesCollection, newCompany);

      // Cria o objeto Company completo com o ID gerado
      const createdCompany: Company = {
        id: docRef.id,
        ...newCompany
      };

      console.log('✅ Empresa salva com ID:', docRef.id);

      // Atualiza o signal adicionando a nova empresa
      this.companies.update(companies => [createdCompany, ...companies]);

      //^ ENVIO DE NOTIFICAÇÃO
      this.notificationService.createNotification(
        NotificationTitle.CREATE_COMPANY,
        NotificationType.SUCCESS,
        `${createdCompany.name} Criado com sucesso!`,
        false,
        `companies/${createdCompany.id}`,
      );

      return createdCompany;

    } catch (error) {
      console.error('❌ Erro ao salvar empresa:', error);
      throw error;
    }
  }

  async updateCompany(companyId: string, companyData: Partial<Omit<Company, 'id' | 'created' | 'helpDeskCompanyId'>>): Promise<Company> {
    try {
      console.log('📝 Atualizando empresa:', companyId, companyData);

      const currentUser = this._sessionService.getSession();
      if (!currentUser) {
        throw new Error('Usuário não está logado');
      }

      const updateData = {
        ...companyData,
        updated: new Date()
      };

      // Atualiza a empresa no Firestore
      const companyRef = doc(this._firestore, PATH_COMPANIES, companyId);
      await updateDoc(companyRef, updateData);

      // Busca a empresa atualizada
      const updatedCompany = await this.getCompanyById(companyId);

      if (!updatedCompany) {
        throw new Error('Empresa não encontrada após atualização');
      }

      console.log('✅ Empresa atualizada:', updatedCompany);

      // Atualiza o signal com a empresa modificada
      this.companies.update(companies =>
        companies.map(company =>
          company.id === companyId ? updatedCompany : company
        )
      );

      //^ ENVIO DE NOTIFICAÇÃO
      this.notificationService.createNotification(
        NotificationTitle.CREATE_COMPANY,
        NotificationType.SUCCESS,
        `${updatedCompany.name} Criado com sucesso!`,
        false,
        `/companies/${updatedCompany.id}`,
      );

      return updatedCompany;

    } catch (error) {
      console.error('❌ Erro ao atualizar empresa:', error);
      throw error;
    }
  }

  async deleteCompany(companyId: string): Promise<boolean> {
    try {
      console.log('🗑️ Excluindo empresa:', companyId);

      const currentUser = this._sessionService.getSession();
      if (!currentUser) {
        throw new Error('Usuário não está logado');
      }

      // Atualiza a empresa marcando como deletada
      const companyRef = doc(this._firestore, PATH_COMPANIES, companyId);
      await updateDoc(companyRef, {
        deleted: true,
        updated: new Date()
      });

      console.log('✅ Empresa marcada como excluída:', companyId);

      // Remove a empresa do signal
      this.companies.update(companies =>
        companies.filter(company => company.id !== companyId)
      );

      this.getCompanyById(companyId).then(result => {
     //^ ENVIO DE NOTIFICAÇÃO
        this.notificationService.createNotification(
          NotificationTitle.CREATE_COMPANY,
          NotificationType.SUCCESS,
          `Empresa ${result?.name} excluida com sucesso`,
          false,
          null
        );
      });
   
      return true;

    } catch (error) {
      console.error('❌ Erro ao excluir empresa:', error);
      return false;
    }
  }

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
          deleted: data['deleted'] || false,
          created: data['created'] || new Date(),
          updated: data['updated'] || null,
          cnpj: data['cnpj'],
          city: data['city'],
          state: data['state'],
          address: data['address'],
          zipcode: data['zipcode'],
          phone: data['phone'],
          connectionServ: data['connectionServ'],
          email: data['email'],
          versionServ: data['versionServ'] || null,
          clientsId: data['clientsId'] || [],
          helpDeskCompanyId: data['helpDeskCompanyId']
        };


        return company;
      }

      return null;

    } catch (error) {
      console.error('❌ Erro ao buscar empresa por ID:', error);
      return null;
    }
  }

  /*
  export interface Company {
      id: string;
      name: string;
      keywords: string[];
      deleted: boolean;
      created: Date; // timestamp formato do firebase (1 de julho de 2025 às 11:35:36 UTC-3), salvar no formato Date e criar um pipe para exibir a data no formato "01/07/2025 - 11:35:36" 
      updated: Date | null; // timestamp formato do firebase (1 de julho de 2025 às 11:35:36 UTC-3), salvar no formato Date e criar um pipe para exibir a data no formato "01/07/2025 - 11:35:36" 
      cnpj: string;
      city: string;
      state: string;
      address: string;
      zipcode: string;
      phone: string;
      connectionServ: string;
      email: string;
      versionServ: string | null;
      clientsId: string[];
      clients?: User[];
      helpDeskCompanyId?: string;
    }
  */


}