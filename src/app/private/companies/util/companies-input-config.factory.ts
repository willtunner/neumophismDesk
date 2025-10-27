import { TranslateService } from '@ngx-translate/core';
import { InputConfig } from '../../../interfaces/input-config.interface';
import { InputType } from '../../../enuns/input-types.enum';
import { t, tParams } from './companies-translation.util';

export function buildInputConfigs(translate: TranslateService): Record<string, InputConfig> {
  return {
    name: {
      type: InputType.TEXT,
      formControlName: 'name',
      label: t(translate, 'COMPANIES.FIELDS.NAME'),
      required: true,
      placeholder: t(translate, 'COMPANIES.PLACEHOLDERS.NAME'),
      minLength: 2,
      maxLength: 100,
      customErrorMessages: {
        required: t(translate, 'VALIDATOR-ERROR-MESSAGES.REQUIRED'),
        minlength: tParams(translate, 'VALIDATOR-ERROR-MESSAGES.MINLENGTH', { requiredLength: 2 }),
      },
    },
    cnpj: {
      type: InputType.CNPJ,
      formControlName: 'cnpj',
      label: t(translate, 'COMPANIES.FIELDS.CNPJ'),
      required: true,
      placeholder: t(translate, 'COMPANIES.PLACEHOLDERS.CNPJ'),
      customErrorMessages: {
        required: t(translate, 'VALIDATOR-ERROR-MESSAGES.REQUIRED'),
      },
    },
    email: {
      type: InputType.EMAIL,
      formControlName: 'email',
      label: t(translate, 'COMPANIES.FIELDS.EMAIL'),
      required: true,
      placeholder: t(translate, 'COMPANIES.PLACEHOLDERS.EMAIL'),
      customErrorMessages: {
        required: t(translate, 'VALIDATOR-ERROR-MESSAGES.REQUIRED'),
        email: t(translate, 'VALIDATOR-ERROR-MESSAGES.EMAIL'),
      },
    },
    phone: {
      type: InputType.PHONE,
      formControlName: 'phone',
      label: t(translate, 'COMPANIES.FIELDS.PHONE'),
      required: true,
      placeholder: t(translate, 'COMPANIES.PLACEHOLDERS.PHONE'),
      customErrorMessages: {
        required: t(translate, 'VALIDATOR-ERROR-MESSAGES.REQUIRED'),
      },
    },
    address: {
      type: InputType.TEXT,
      formControlName: 'address',
      label: t(translate, 'COMPANIES.FIELDS.ADDRESS'),
      required: true,
      placeholder: t(translate, 'COMPANIES.PLACEHOLDERS.ADDRESS'),
      customErrorMessages: {
        required: t(translate, 'VALIDATOR-ERROR-MESSAGES.REQUIRED'),
      },
    },
    city: {
      type: InputType.TEXT,
      formControlName: 'city',
      label: t(translate, 'COMPANIES.FIELDS.CITY'),
      required: true,
      placeholder: t(translate, 'COMPANIES.PLACEHOLDERS.CITY'),
      customErrorMessages: {
        required: t(translate, 'VALIDATOR-ERROR-MESSAGES.REQUIRED'),
      },
    },
    state: {
      type: InputType.TEXT,
      formControlName: 'state',
      label: t(translate, 'COMPANIES.FIELDS.STATE'),
      required: true,
      placeholder: t(translate, 'COMPANIES.PLACEHOLDERS.STATE'),
      customErrorMessages: {
        required: t(translate, 'VALIDATOR-ERROR-MESSAGES.REQUIRED'),
      },
    },
    zipcode: {
      type: InputType.CEP,
      formControlName: 'zipcode',
      label: t(translate, 'COMPANIES.FIELDS.ZIPCODE'),
      required: true,
      placeholder: t(translate, 'COMPANIES.PLACEHOLDERS.ZIPCODE'),
      customErrorMessages: {
        required: t(translate, 'VALIDATOR-ERROR-MESSAGES.REQUIRED'),
      },
    },
    connectionServ: {
      type: InputType.TEXT,
      formControlName: 'connectionServ',
      label: t(translate, 'COMPANIES.FIELDS.CONNECTION_SERV'),
      required: true,
      placeholder: t(translate, 'COMPANIES.PLACEHOLDERS.CONNECTION_SERV'),
      customErrorMessages: {
        required: t(translate, 'VALIDATOR-ERROR-MESSAGES.REQUIRED'),
      },
    },
    versionServ: {
      type: InputType.TEXT,
      formControlName: 'versionServ',
      label: t(translate, 'COMPANIES.FIELDS.VERSION_SERV'),
      placeholder: t(translate, 'COMPANIES.PLACEHOLDERS.VERSION_SERV'),
    },
    search: {
      type: InputType.TEXT,
      formControlName: 'search',
      label: t(translate, 'COMPANIES.FILTERS.SEARCH'),
      placeholder: t(translate, 'COMPANIES.FILTERS.SEARCH_PLACEHOLDER'),
    }
  };
}