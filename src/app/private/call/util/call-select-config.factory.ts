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
  console.log('🔧 buildSelectConfigs - Empresas recebidas:', companies.length);
  console.log('🔧 buildSelectConfigs - Clientes recebidos:', clients.length);
  return {
    company: {
      formControlName: 'companyId',
      label: t(translate, 'INPUTS_FIELDS.COMPANY'),
      required: true,
      placeholder: t(translate, 'INPUTS_FIELDS.SELECT_COMPANY'),
      options: companies.map(c => ({ value: c.id, label: c.name })),
      iconName: 'business',
      customErrorMessages: { required: t(translate, 'VALIDATOR_ERROR_MESSAGES.REQUIRED') },
    },
    client: {
      formControlName: 'clientId',
      label: t(translate, 'INPUTS_FIELDS.CLIENT'),
      required: true,
      placeholder: isLoadingClients
        ? t(translate, 'LOADING_CLIENTS.LOADING_CLIENTS')
        : clients.length === 0
          ? t(translate, 'INPUTS_FIELDS.SELECT_CLIENT')
          : t(translate, 'CALL_PAGE.NO_HAVE_CLIENTS'),
      options: clients.map(c => ({ value: c.id, label: c.name })),
      iconName: 'person',
      customErrorMessages: { required: t(translate, 'VALIDATOR_ERROR_MESSAGES.REQUIRED') },
    },
  };
}
