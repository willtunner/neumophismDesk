import { Injectable, inject } from '@angular/core';
import { CompanyService } from '../../../services/company';
import { Company } from '../../../models/models';

@Injectable({ providedIn: 'root' })
export class CallCompanyLoaderService {
  private companyService = inject(CompanyService);

  async loadCompanies(): Promise<Company[]> {
    try {
      return await this.companyService.loadAllCompanies(false);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      return [];
    }
  }
}
