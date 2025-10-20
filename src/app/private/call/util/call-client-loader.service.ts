import { Injectable, inject } from '@angular/core';
import { ClientService } from '../../../services/client';
import { Company, User } from '../../../models/models';

@Injectable({ providedIn: 'root' })
export class CallClientLoaderService {
  private clientService = inject(ClientService);

  async loadClientsByCompany(company: Company): Promise<User[]> {
    try {
      const ids = company.clientsId || [];
      if (ids.length === 0) return [];
      return await this.clientService.getClientsByIds(ids);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      return [];
    }
  }
}
