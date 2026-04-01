import { TranslateService } from '@ngx-translate/core';
import { InputConfig } from '../../../interfaces/input-config.interface';
import { InputType } from '../../../enuns/input-types.enum';
import { LoginInputConfigs } from './login.types';


const t = (translate: TranslateService, key: string) => {
    const value = translate.instant(key);
    return value === key ? `❌ ${key}` : value;
};
const tParams = (translate: TranslateService, key: string, params: any) =>
    translate.instant(key, params);

export function buildLoginInputConfigs(
    translate: TranslateService
): LoginInputConfigs {
    return {
        email: {
            type: InputType.EMAIL,
            formControlName: 'email',
            label: 'E-mail',
            required: true,
            placeholder: 'Digite seu e-mail',
            pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
            customErrorMessages: {
                required: 'Este campo é obrigatório',
                pattern: 'Por favor, insira um e-mail válido'
            }
        },

        password: {
            type: InputType.PASSWORD,
            formControlName: 'password',
            label: 'Senha',
            required: true,
            placeholder: 'Digite sua senha',
            minLength: 6,
            customErrorMessages: {
                required: 'Este campo é obrigatório',
                minlength: tParams(
                    translate,
                    'VALIDATOR_ERROR_MESSAGES.MINLENGTH',
                    { requiredLength: 6 }
                )
            }
        }
    };
}