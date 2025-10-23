// input-dynamic.component.ts
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators, AbstractControl } from '@angular/forms';
import { InputConfig } from '../../../interfaces/input-config.interface';
import { InputType } from '../../../enuns/input-types.enum';
import { InputValidatorsService } from '../../../services/input-validators';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-input-dynamic',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input-dynamic.html',
  styleUrls: ['./input-dynamic.css']
})
export class InputDynamicComponent implements OnInit {
  @Input() config: InputConfig = {} as InputConfig;
  @Input() control: FormControl = new FormControl();
  @Input() isPasswordVisible: boolean = false;
  @Input() showImage: boolean = true;
  @Input() submitted: boolean = false;
  @Output() valueChange = new EventEmitter<any>();

  inputType: string = 'text';
  errorMessage: string = '';
  isFocused: boolean = false;
  safeIconSvg: SafeHtml = '';
  touched: boolean = false;

  // Ícones SVG para cada tipo
  private readonly icons: { [key in InputType]: string } = {
    [InputType.USER]: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    `,
    [InputType.EMAIL]: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    `,
    [InputType.TEXT]: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10,9 9,9 8,9"/>
      </svg>
    `,
    [InputType.NUMBER]: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    `,
    [InputType.AGE]: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    `,
    [InputType.CEP]: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9v-9m0-9v9"/>
      </svg>
    `,
    [InputType.CPF]: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    `,
    [InputType.CNPJ]: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
      </svg>
    `,
    [InputType.TEXTAREA]: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10,9 9,9 8,9"/>
      </svg>
    `,
    [InputType.PASSWORD]: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    `,
    [InputType.SELECT]: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    `,
    [InputType.PHONE]: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    `,
    [InputType.IMAGE]: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    `,
    [InputType.CONNECTION]: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
        <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
        <line x1="12" y1="20" x2="12" y2="20"/>
      </svg>
    `,
    [InputType.TITLE]: `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M4 4h16v16H4z"/>
    <path d="M12 7v10"/>
    <path d="M8 7h8"/>
  </svg>
`,
   [InputType.DESCRIPTION]: `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M9 6h8.5M9 11h11.5M9 16h8.5M5 9l-2 2 2 2"/>
  </svg>
`,
  };

  constructor(private validatorsService: InputValidatorsService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.setupInputType();
    this.setupValidators();
    this.setupValueChanges();
    this.updateIcon();
  }

  ngOnChanges(): void {
    if (!this.config) return;

    // Atualiza tipo do input dinamicamente ao clicar no olho
    if (this.config.formControlName === 'password') {
      this.inputType = this.isPasswordVisible ? 'text' : 'password';
    }
    this.updateIcon();

    // Atualiza mensagens de erro quando submitted muda
    if (this.submitted) {
      this.updateErrorMessage();
    }
  }

  private updateIcon(): void {
    const iconSvg = this.getIconSvg();
    this.safeIconSvg = this.sanitizer.bypassSecurityTrustHtml(iconSvg);
  }

  private setupInputType(): void {
    if (this.config.formControlName === 'password') {
      this.inputType = this.isPasswordVisible ? 'text' : 'password';
      return;
    }

    switch (this.config.type) {
      case InputType.EMAIL:
        this.inputType = 'email';
        break;
      case InputType.NUMBER:
      case InputType.AGE:
        this.inputType = 'number';
        break;
      case InputType.TEXTAREA:
        this.inputType = 'textarea';
        break;
      default:
        this.inputType = 'text';
    }
  }

  private setupValidators(): void {
    if (!this.control) {
      console.warn('FormControl não fornecido para o input dinâmico');
      return;
    }

    // Usa o serviço para obter as validações padrão
    const defaultValidators = this.validatorsService.getDefaultValidators(this.config.type, this.config);
    const customValidators = this.config.validators || [];

    const allValidators = [...defaultValidators, ...customValidators];

    this.control.setValidators(allValidators);
    this.control.updateValueAndValidity();
  }

  private setupValueChanges(): void {
    this.control.valueChanges.subscribe(value => {
      this.valueChange.emit(value);
      this.updateErrorMessage();
    });

    this.control.statusChanges.subscribe(() => {
      this.updateErrorMessage();
    });
  }

  private updateErrorMessage(): void {
    // MUDANÇA PRINCIPAL: Mostra erro se o campo foi tocado OU se o formulário foi submetido
    const shouldShowError = this.control.invalid && (this.touched || this.submitted || this.control.touched || this.control.dirty);

    if (shouldShowError) {
      const errors = this.control.errors;
      if (errors) {
        const firstErrorKey = Object.keys(errors)[0];
        const errorValue = errors[firstErrorKey];

        if (this.config.customErrorMessages && this.config.customErrorMessages[firstErrorKey]) {
          this.errorMessage = this.config.customErrorMessages[firstErrorKey];
        } else {
          this.errorMessage = this.validatorsService.getDefaultErrorMessage(
            firstErrorKey,
            errorValue,
            this.config
          );
        }
      }
    } else {
      this.errorMessage = '';
    }
  }

  getIconSvg(): string {
    // Retorna ícone customizado se fornecido
    if (this.config.customIcon) {
      return this.config.customIcon;
    }

    // Retorna ícone por nome do Material se fornecido
    if (this.config.iconName) {
      return this.getMaterialIcon(this.config.iconName);
    }

    // Para campos de password, usa o ícone específico
    if (this.config.formControlName === 'password') {
      return this.icons[InputType.PASSWORD];
    }

    // Retorna ícone padrão baseado no tipo
    return this.icons[this.config.type] || this.icons[InputType.TEXT];
  }

  private getMaterialIcon(iconName: string): string {
    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <text x="12" y="16" text-anchor="middle" font-size="10" fill="currentColor">${iconName.charAt(0)}</text>
      </svg>
    `;
  }

  onFocus(): void {
    this.isFocused = true;
  }

  onBlur(): void {
    this.isFocused = false;
    this.markAsTouched();
  }

  markAsTouched(): void {
    if (!this.touched) {
      this.touched = true;
      this.control.markAsTouched();
      this.updateErrorMessage();
    }
  }

  // Método para forçar a exibição de erros (pode ser chamado pelo componente pai)
  showErrors(): void {
    this.touched = true;
    this.updateErrorMessage();
  }

  get isTextarea(): boolean {
    return this.config.type === InputType.TEXTAREA;
  }

  get hasValue(): boolean {
    return this.control.value && this.control.value.toString().trim().length > 0;
  }

  get isInvalid(): boolean {
    // MUDANÇA: Inclui submitted na verificação
    return this.control.invalid && (this.touched || this.submitted || this.control.touched || this.control.dirty);
  }
}