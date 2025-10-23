// src/app/services/helpdesk-company.service.ts
import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  CollectionReference,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  orderBy,
} from '@angular/fire/firestore';
import { HelpDeskCompany } from '../models/models';

const PATH_HELPDESK_COMPANIES = 'helpdeskCompanies';

@Injectable({
  providedIn: 'root',
})
export class HelpdeskCompanyService {
  private _firestore = inject(Firestore);

  // Getter lazy da coleção
  private get _helpdeskCompaniesCollection(): CollectionReference {
    return collection(this._firestore, PATH_HELPDESK_COMPANIES);
  }

  /**
   * Busca uma empresa helpdesk por ID
   */
  async getHelpdeskCompanyById(id: string): Promise<HelpDeskCompany | null> {
    if (!id) return null;

    try {
      const docRef = doc(this._helpdeskCompaniesCollection, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.warn('Helpdesk company não encontrada:', id);
        return null;
      }

      return this.mapFirestoreDataToHelpdeskCompany(docSnap.id, docSnap.data());
    } catch (error) {
      console.error('Erro ao buscar helpdesk company:', error);
      return null;
    }
  }

  /**
   * Busca múltiplas empresas helpdesk por IDs
   */
  async getHelpdeskCompaniesByIds(ids: string[]): Promise<HelpDeskCompany[]> {
    if (!ids || ids.length === 0) return [];

    const uniqueIds = [...new Set(ids.filter(Boolean))];
    const promises = uniqueIds.map(id => this.getHelpdeskCompanyById(id));
    const results = await Promise.all(promises);
    return results.filter((c): c is HelpDeskCompany => c !== null);
  }

  /**
   * Busca todas as helpdesk companies
   */
  async getAllHelpdeskCompanies(): Promise<HelpDeskCompany[]> {
    try {
      const q = query(this._helpdeskCompaniesCollection, orderBy('created', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.mapFirestoreDataToHelpdeskCompany(doc.id, doc.data()));
    } catch (error) {
      console.error('Erro ao buscar todas as helpdesk companies:', error);
      return [];
    }
  }

  /**
   * Cria ou atualiza uma helpdesk company
   */
  async saveHelpdeskCompany(data: HelpDeskCompany): Promise<HelpDeskCompany> {
    try {
      const now = new Date();

      if (!data.id) {
        // Criação
        const newData: Omit<HelpDeskCompany, 'id'> = {
          ...data,
          created: now,
          updated: now,
          keywords: this.generateKeywords(data.name),
          active: data.active ?? true,
        };

        const docRef = await addDoc(this._helpdeskCompaniesCollection, newData);
        await updateDoc(docRef, { id: docRef.id });

        console.log('Helpdesk company criada:', docRef.id);
        return { id: docRef.id, ...newData };
      }

      // Atualização
      const docRef = doc(this._helpdeskCompaniesCollection, data.id);
      const updatePayload = {
        ...data,
        updated: now,
        keywords: this.generateKeywords(data.name),
      };

      await updateDoc(docRef, updatePayload);
      console.log('Helpdesk company atualizada:', data.id);
      return updatePayload as HelpDeskCompany;
    } catch (error) {
      console.error('Erro ao salvar helpdesk company:', error);
      throw error;
    }
  }

  /**
   * Converte dados do Firestore para HelpDeskCompany
   */
  private mapFirestoreDataToHelpdeskCompany(id: string, data: any): HelpDeskCompany {
    const created = data['created']?.toDate?.() || new Date();
    const updated = data['updated']?.toDate?.() || new Date();

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
   * Gera keywords a partir do nome (ex: "Suporte Total" → ["suporte", "total", "suporte total"])
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