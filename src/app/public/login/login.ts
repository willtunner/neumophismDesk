import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { InputDynamicComponent } from '../../shared/components/input-dynamic/input-dynamic';
import { InputType } from '../../enuns/input-types.enum';
import { InputConfig } from '../../interfaces/input-config.interface';
import { InputValidatorsService } from '../../services/input-validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputDynamicComponent
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  form: FormGroup;
  showPassword: boolean = false;
  loading = false;
  showSuccess = false;
  emailError = '';
  passwordError = '';
  

  // Configurações para os inputs dinâmicos
  inputConfigs = {
    email: {
      type: InputType.EMAIL,
      formControlName: 'email',
      label: 'Email Address',
      required: true,
      placeholder: 'Enter your email address',
      customErrorMessages: {
        required: 'Email is required',
        pattern: 'Please enter a valid email address'
      }
    } as InputConfig,
    password: {
      type: InputType.TEXT, // Usaremos TEXT para poder alternar entre password/text
      formControlName: 'password',
      label: 'Password',
      required: true,
      placeholder: 'Enter your password',
      minLength: 6,
      customErrorMessages: {
        required: 'Password is required',
        minlength: 'Password must be at least 6 characters'
      }
    } as InputConfig
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private validatorsService: InputValidatorsService
  ) {
    // Usa o serviço para obter as validações padrão
    const emailValidators = this.validatorsService.getDefaultValidators(InputType.EMAIL, {
      required: true,
      label: 'Email Address'
    });

    const passwordValidators = this.validatorsService.getDefaultValidators(InputType.TEXT, {
      required: true,
      minLength: 6,
      label: 'Password'
    });

    this.form = this.fb.group({
      email: ['', emailValidators],
      password: ['', passwordValidators],
      remember: [false]
    });
  }

  // Método auxiliar para obter o FormControl
  getControl(controlName: string): FormControl {
    return this.form.get(controlName) as FormControl;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
    this.inputConfigs.password = {
      ...this.inputConfigs.password,
      type: this.showPassword ? InputType.TEXT : InputType.CPF, // muda o ícone apenas
      customIcon: this.showPassword ? this.getEyeClosedIcon() : this.getEyeOpenIcon()
    };
  }

  private getEyeOpenIcon(): string {
    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    `;
  }

  private getEyeClosedIcon(): string {
    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    `;
  }

  validateEmail() {
    const emailControl = this.form.get('email');
    
    if (!emailControl) return false;

    // Usa o serviço para obter mensagens de erro
    if (emailControl.errors) {
      const firstErrorKey = Object.keys(emailControl.errors)[0];
      const errorValue = emailControl.errors[firstErrorKey];
      
      // Verifica se há mensagem customizada
      if (this.inputConfigs.email.customErrorMessages && 
          this.inputConfigs.email.customErrorMessages[firstErrorKey]) {
        this.emailError = this.inputConfigs.email.customErrorMessages[firstErrorKey];
      } else {
        // Usa o serviço para mensagem padrão
        this.emailError = this.validatorsService.getDefaultErrorMessage(
          firstErrorKey, 
          errorValue, 
          this.inputConfigs.email
        );
      }
      return false;
    }
    
    this.emailError = '';
    return true;
  }

  validatePassword() {
    const passwordControl = this.form.get('password');
    
    if (!passwordControl) return false;

    // Usa o serviço para obter mensagens de erro
    if (passwordControl.errors) {
      const firstErrorKey = Object.keys(passwordControl.errors)[0];
      const errorValue = passwordControl.errors[firstErrorKey];
      
      // Verifica se há mensagem customizada
      if (this.inputConfigs.password.customErrorMessages && 
          this.inputConfigs.password.customErrorMessages[firstErrorKey]) {
        this.passwordError = this.inputConfigs.password.customErrorMessages[firstErrorKey];
      } else {
        // Usa o serviço para mensagem padrão
        this.passwordError = this.validatorsService.getDefaultErrorMessage(
          firstErrorKey, 
          errorValue, 
          this.inputConfigs.password
        );
      }
      return false;
    }
    
    this.passwordError = '';
    return true;
  }

  clearError(field: string) {
    if (field === 'email') {
      this.emailError = '';
    } else if (field === 'password') {
      this.passwordError = '';
    }
  }

  async onSubmit() {
    // Marca todos os campos como touched para trigger das validações
    this.form.markAllAsTouched();

    const isEmailValid = this.validateEmail();
    const isPasswordValid = this.validatePassword();
    
    if (!isEmailValid || !isPasswordValid) return;

    this.loading = true;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { email, password, remember } = this.form.value;
      console.log('Login successful:', { email, password, remember });
      
      this.showSuccess = true;
      
      // Navigate to home page after success message
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 2000);
      
    } catch (error) {
      this.passwordError = 'Login failed. Please try again.';
      console.error('Login error:', error);
    } finally {
      this.loading = false;
    }
  }

  recover() {
    const email = this.form.value.email;
    console.log('Recover password for:', email);
    // Navigate to recovery page
  }

  signup() {
    console.log('Navigate to signup');
    // Navigate to signup page
  }

  socialLogin(provider: string) {
    console.log(`Social login with: ${provider}`);
    // Implement social login logic
  }
}