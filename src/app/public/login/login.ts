import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { InputDynamicComponent } from '../../shared/components/input-dynamic/input-dynamic';
import { InputType } from '../../enuns/input-types.enum';
import { InputConfig } from '../../interfaces/input-config.interface';
import { InputValidatorsService } from '../../services/input-validators';
import { AuthService } from '../../services/auth.service'; // 👈 Importa o AuthService

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
      type: InputType.TEXT,
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
    private validatorsService: InputValidatorsService,
    private authService: AuthService // 👈 Injetamos o AuthService
  ) {
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

  getControl(controlName: string): FormControl {
    return this.form.get(controlName) as FormControl;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  clearError(field: string) {
    if (field === 'email') {
      this.emailError = '';
    } else if (field === 'password') {
      this.passwordError = '';
    }
  }

  async onSubmit() {
    this.form.markAllAsTouched();
    const isEmailValid = this.validateEmail();
    const isPasswordValid = this.validatePassword();
    if (!isEmailValid || !isPasswordValid) return;

    this.loading = true;
    const { email, password, remember } = this.form.value;

    try {
      console.log('🚀 Enviando login para AuthService:', { email, password });
      const success = await this.authService.login(email, password); // 👈 Chama o AuthService

      if (success) {
        this.showSuccess = true;
        console.log('✅ Login bem-sucedido via Firestore!');

        // Redireciona após 2 segundos
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 2000);
      }
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      this.passwordError = error.message || 'Login failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  validateEmail() {
    const emailControl = this.form.get('email');
    if (!emailControl) return false;

    if (emailControl.errors) {
      const firstErrorKey = Object.keys(emailControl.errors)[0];
      const errorValue = emailControl.errors[firstErrorKey];
      this.emailError =
        this.inputConfigs.email.customErrorMessages?.[firstErrorKey] ||
        this.validatorsService.getDefaultErrorMessage(firstErrorKey, errorValue, this.inputConfigs.email);
      return false;
    }
    this.emailError = '';
    return true;
  }

  validatePassword() {
    const passwordControl = this.form.get('password');
    if (!passwordControl) return false;

    if (passwordControl.errors) {
      const firstErrorKey = Object.keys(passwordControl.errors)[0];
      const errorValue = passwordControl.errors[firstErrorKey];
      this.passwordError =
        this.inputConfigs.password.customErrorMessages?.[firstErrorKey] ||
        this.validatorsService.getDefaultErrorMessage(firstErrorKey, errorValue, this.inputConfigs.password);
      return false;
    }
    this.passwordError = '';
    return true;
  }

  recover() {
    console.log('Recover password for:', this.form.value.email);
  }

  signup() {
    console.log('Navigate to signup');
  }

  socialLogin(provider: string) {
    console.log(`Social login with: ${provider}`);
  }
}
