import { TranslateService } from '@ngx-translate/core';
import { SelectConfig } from '../../../interfaces/select-config.interface';
import { Company, User } from '../../../models/models';
import { t } from './call-translation.util';

export function buildSelectConfigs(
  translate: TranslateService,
  companies: Company[],
  clients: User[],
  isLoadingClients: boolean
): Record<string, SelectConfig> {
  return {
    empresa: {
      formControlName: 'companyId',
      label: t(translate, 'INPUTS-FIELS.COMPANY'),
      required: true,
      placeholder: t(translate, 'INPUTS-FIELS.SELECT_COMPANY'),
      options: companies.map(c => ({ value: c.id, label: c.name })),
      iconName: 'business',
      customErrorMessages: { required: t(translate, 'VALIDATOR-ERROR-MESSAGES.REQUIRED') },
    },
    cliente: {
      formControlName: 'clientId',
      label: t(translate, 'INPUTS-FIELS.CLIENT'),
      required: true,
      placeholder: isLoadingClients
        ? 'Carregando clientes...'
        : clients.length === 0
          ? 'Nenhum cliente encontrado'
          : t(translate, 'INPUTS-FIELS.SELECT_CLIENT'),
      options: clients.map(c => ({ value: c.id, label: c.name })),
      iconName: 'person',
      customErrorMessages: { required: t(translate, 'VALIDATOR-ERROR-MESSAGES.REQUIRED') },
    },
  };
}
