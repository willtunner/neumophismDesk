import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HelpDeskCompany, User } from '../../models/models';
import { HelpdeskCompanyService } from '../../services/helpdesk-company-service';
import { PhonePipe } from '../../pipes/phone.pipe';
import { CnpjPipe } from '../../pipes/cnpj.pipe';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-success-signup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    PhonePipe,
    CnpjPipe
  ],
  templateUrl: './success-signup.html',
  styleUrls: ['./success-signup.css']
})
export class SuccessSignupComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private helpCompanyService = inject(HelpdeskCompanyService);
  private authService = inject(AuthService);

  // 🔹 MANTENDO AS VARIÁVEIS DO HTML ORIGINAL
  clientForm: FormGroup;
  companyData: HelpDeskCompany | null = null;
  isLoading = false;
  showPassword = false;
  showClientForm = true;

  // Getters seguros para os dados da empresa
  get companyName(): string {
    return this.companyData?.name || '';
  }

  get companyCnpj(): string | number {
    return this.companyData?.cnpj || '';
  }

  get companyEmail(): string {
    return this.companyData?.email || '';
  }

  get companyPhone(): string | number {
    return this.companyData?.phone || '';
  }

  get companyAddress(): string {
    if (!this.companyData) return '';
    return `${this.companyData.address}, ${this.companyData.neighborhood} - ${this.companyData.city}/${this.companyData.state}`;
  }

  constructor() {
    this.clientForm = this.createClientForm();
  }

  ngOnInit(): void {
    this.loadCompanyData();
  }

  private loadCompanyData(): void {
    // Tenta buscar do serviço primeiro
    this.companyData = this.helpCompanyService.getLastCreatedCompany();

    if (this.companyData) {
      console.log('✅ Dados da empresa carregados do serviço:', this.companyData);
    } else {
      console.warn('⚠️ Nenhum dado de empresa encontrado');
      setTimeout(() => {
        this.router.navigate(['/signup']);
      }, 3000);
    }
  }

  private createClientForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      // 🔹 ADICIONANDO CAMPO ROLE (oculto no HTML ou pode ser mantido como ADMIN fixo)
      role: ['ADMIN', [Validators.required]],
      imageUrl: [''],
      connection: ['']
    }, {
      validators: [this.passwordMatchValidator, this.phoneFormatValidator]
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
  }

  // 🔹 MANTENDO onClientSubmit() MAS INTERNAMENTE SALVA UM FUNCIONÁRIO
  async onClientSubmit(): Promise<void> {
    if (this.clientForm.valid && this.companyData) {
      this.isLoading = true;

      try {
        const formValue = this.clientForm.value;

        // Remove formatação do telefone antes de salvar
        const phoneDigits = formValue.phone.replace(/\D/g, '');

        // 🔹 Dados do funcionário (User) - usando os dados do formulário "cliente"
        const employeeData: Omit<User, 'id' | 'created' | 'updated'> = {
          name: formValue.name,
          email: formValue.email,
          phone: phoneDigits,
          username: formValue.username,
          password: formValue.password,
          imageUrl: formValue.imageUrl || '',
          connection: formValue.connection || '',
          companyId: this.companyData.id, // ID da empresa HelpDesk
          roles: [formValue.role || 'ADMIN'], // Usa o role do formulário ou padrão ADMIN
          deleted: false,
          isLoggedIn: false,
          helpDeskCompanyId: this.companyData.id // ID da empresa HelpDesk
        };

        console.log('💾 Salvando funcionário (como cliente):', employeeData);

        // 🔹 USA O SERVIÇO PARA SALVAR O FUNCIONÁRIO
        const savedEmployee = await this.helpCompanyService.saveEmployee(employeeData, this.companyData);

        console.log('✅ Funcionário salvo com sucesso:', savedEmployee);

        // 🔹 FAZ LOGIN AUTOMÁTICO DO FUNCIONÁRIO
        await this.autoLogin(savedEmployee);

        // Limpa a empresa armazenada após uso
        this.helpCompanyService.clearLastCreatedCompany();

        // Redireciona para o dashboard
        this.router.navigate(['/dashboard'], {
          state: {
            message: 'Funcionário cadastrado com sucesso!',
            company: this.companyData,
            employee: savedEmployee
          }
        });

      } catch (error) {
        console.error('❌ Erro ao salvar funcionário:', error);
      } finally {
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  // 🔹 MANTENDO skipClientRegistration()
  skipClientRegistration(): void {
    // Limpa a empresa armazenada
    this.helpCompanyService.clearLastCreatedCompany();

    this.router.navigate(['/dashboard'], {
      state: {
        message: 'Empresa cadastrada com sucesso!',
        company: this.companyData
      }
    });
  }

  /**
   * 🔹 FAZ LOGIN AUTOMÁTICO DO FUNCIONÁRIO RECÉM-CRIADO
   */
  private async autoLogin(employee: User): Promise<void> {
    try {
      console.log('🔐 Fazendo login automático do funcionário:', employee.email);
      
      // Usa o AuthService para fazer login
      await this.authService.login(employee.email, employee.password);
      
      console.log('✅ Login automático realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no login automático:', error);
      // Não impede o fluxo principal se o login automático falhar
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.clientForm.controls).forEach(key => {
      const control = this.clientForm.get(key);
      control?.markAsTouched();
    });
  }

  formatPhone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    if (value.length <= 11) {
      value = value.replace(/(\d{2})(\d)/, '($1) $2');
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }

    this.clientForm.patchValue({ phone: value });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Validador personalizado para telefone
  private phoneFormatValidator(form: FormGroup) {
    const phoneControl = form.get('phone');

    if (phoneControl && phoneControl.value) {
      const phoneDigits = phoneControl.value.replace(/\D/g, '');

      if (phoneDigits.length !== 10 && phoneDigits.length !== 11) {
        phoneControl.setErrors({ invalidPhone: true });
      } else {
        // Remove o erro se existir
        if (phoneControl.errors?.['invalidPhone']) {
          const { invalidPhone, ...otherErrors } = phoneControl.errors;
          phoneControl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
        }
      }
    }
  }

  get formControls() {
    return this.clientForm.controls;
  }
}