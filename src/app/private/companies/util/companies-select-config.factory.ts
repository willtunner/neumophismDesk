import { TranslateService } from '@ngx-translate/core';
import { SelectConfig } from '../../../interfaces/select-config.interface';
import { t } from './companies-translation.util';

export function buildSelectConfigs(translate: TranslateService): Record<string, SelectConfig> {
  return {
    filterField: {
      formControlName: 'filterField',
      label: t(translate, 'COMPANIES.FILTERS.FILTER_BY'),
      placeholder: t(translate, 'COMPANIES.FILTERS.SELECT_FIELD'),
      options: [
        { value: 'name', label: t(translate, 'COMPANIES.FIELDS.NAME') },
        { value: 'cnpj', label: t(translate, 'COMPANIES.FIELDS.CNPJ') },
        { value: 'city', label: t(translate, 'COMPANIES.FIELDS.CITY') },
        { value: 'state', label: t(translate, 'COMPANIES.FIELDS.STATE') },
        { value: 'email', label: t(translate, 'COMPANIES.FIELDS.EMAIL') },
        { value: 'versionServ', label: t(translate, 'COMPANIES.FIELDS.VERSION_SERV') },
        { value: 'created', label: t(translate, 'COMPANIES.FIELDS.CREATED') }
      ],
      iconName: 'filter_list',
    },
    state: {
      formControlName: 'state',
      label: t(translate, 'COMPANIES.FIELDS.STATE'),
      required: true,
      placeholder: t(translate, 'COMPANIES.PLACEHOLDERS.STATE'),
      options: [
        { value: 'AC', label: 'Acre' },
        { value: 'AL', label: 'Alagoas' },
        { value: 'AP', label: 'Amapá' },
        { value: 'AM', label: 'Amazonas' },
        { value: 'BA', label: 'Bahia' },
        { value: 'CE', label: 'Ceará' },
        { value: 'DF', label: 'Distrito Federal' },
        { value: 'ES', label: 'Espírito Santo' },
        { value: 'GO', label: 'Goiás' },
        { value: 'MA', label: 'Maranhão' },
        { value: 'MT', label: 'Mato Grosso' },
        { value: 'MS', label: 'Mato Grosso do Sul' },
        { value: 'MG', label: 'Minas Gerais' },
        { value: 'PA', label: 'Pará' },
        { value: 'PB', label: 'Paraíba' },
        { value: 'PR', label: 'Paraná' },
        { value: 'PE', label: 'Pernambuco' },
        { value: 'PI', label: 'Piauí' },
        { value: 'RJ', label: 'Rio de Janeiro' },
        { value: 'RN', label: 'Rio Grande do Norte' },
        { value: 'RS', label: 'Rio Grande do Sul' },
        { value: 'RO', label: 'Rondônia' },
        { value: 'RR', label: 'Roraima' },
        { value: 'SC', label: 'Santa Catarina' },
        { value: 'SP', label: 'São Paulo' },
        { value: 'SE', label: 'Sergipe' },
        { value: 'TO', label: 'Tocantins' }
      ],
      iconName: 'location_on',
      customErrorMessages: {
        required: t(translate, 'VALIDATOR-ERROR-MESSAGES.REQUIRED'),
      },
    }
  };
}