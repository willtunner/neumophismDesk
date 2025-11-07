import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HelpDeskCompany } from '../../models/models';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { HelpdeskCompanyService } from '../../services/helpdesk-company-service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    DateFormatPipe
  ],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private helpCompanyService = inject(HelpdeskCompanyService);

  signupForm: FormGroup;
  isLoading = false;
  showPassword = false;

  // Estados brasileiros
  estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  constructor() {
    this.signupForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Informações da Empresa
      name: ['', [Validators.required, Validators.minLength(3)]],
      cnpj: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
      email: ['', [Validators.required, Validators.email]],

      // Localização
      cep: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      address: ['', [Validators.required]],
      neighborhood: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],

      // Contato
      phone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],

      // Segurança
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],

      // Termos
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
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

  async onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading = true;

      try {
        const formValue = this.signupForm.value;

        // Cria objeto HelpDeskCompany
        const helpDeskCompany: HelpDeskCompany = {
          name: formValue.name,
          keywords: this.generateKeywords(formValue.name),
          created: new Date(),
          updated: new Date(),
          cnpj: Number(formValue.cnpj),
          city: formValue.city,
          state: formValue.state,
          address: formValue.address,
          neighborhood: formValue.neighborhood,
          zipcode: Number(formValue.cep),
          phone: Number(formValue.phone),
          email: formValue.email,
          roles: ['ADMIN'],
          password: formValue.password,
          active: true
        };

        console.log('📋 Enviando empresa para salvar...', helpDeskCompany);

        // 🔹 Aguarda salvar e captura o retorno da empresa criada/atualizada
        const savedCompany = await this.helpCompanyService.saveHelpdeskCompany(helpDeskCompany);

        // 🔹 Mostra no log o objeto realmente salvo (com id do Firestore)
        console.log('✅ Empresa salva com sucesso:', savedCompany);

        // 🔹 Armazena a empresa criada no serviço
        this.helpCompanyService.setLastCreatedCompany(savedCompany);

        // 🔹 Redireciona para a página de sucesso
        this.router.navigate(['/signup-success']);

      } catch (error) {
        console.error('❌ Erro ao salvar empresa HelpDesk:', error);
      } finally {
        this.isLoading = false;
      }

    } else {
      this.markFormGroupTouched();
    }
  }

  private generateKeywords(companyName: string): string[] {
    const nameLower = companyName.toLowerCase();
    const words = nameLower.split(' ').filter(word => word.length > 2);
    const keywords = new Set([nameLower, ...words]);
    return Array.from(keywords);
  }

  private markFormGroupTouched() {
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
      control?.markAsTouched();
    });
  }

  searchCep() {
    const cep = this.signupForm.get('cep')?.value;
    if (cep && cep.length === 8) {
      // Simulação de busca de CEP
      console.log('Buscando CEP:', cep);
      // Aqui você pode integrar com uma API de CEP
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  get formControls() {
    return this.signupForm.controls;
  }

  getCurrentDate(): Date {
    return new Date();
  }
}