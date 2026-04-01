import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { InputDynamicComponent } from '../../shared/components/input-dynamic/input-dynamic';
import { InputType } from '../../enuns/input-types.enum';
import { InputConfig } from '../../interfaces/input-config.interface';
import { InputValidatorsService } from '../../services/input-validators';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { buildLoginInputConfigs } from './util/login-input-config.factory';

type LoginInputConfigs = {
  email: InputConfig;
  password: InputConfig;
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputDynamicComponent,
    TranslateModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})


export class Login implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private validatorsService = inject(InputValidatorsService);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private translate = inject(TranslateService);

  private langSub!: Subscription;

  form!: FormGroup;
  inputConfigs = {} as LoginInputConfigs;

  showPassword = false;
  loading = false;
  showSuccess = false;
  emailError = '';
  passwordError = '';
  darkMode = false;

  ngOnInit() {
    this.initializeForm();
    this.initializeConfigs();

    // 🔹 Igual ao Call: atualiza ao trocar idioma
    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.initializeConfigs();
    });
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
  }

  private initializeForm() {
    const emailValidators = this.validatorsService.getDefaultValidators(InputType.EMAIL, {
      required: true,
      label: 'Email'
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

  private initializeConfigs() {
    this.inputConfigs = buildLoginInputConfigs(this.translate);
  }

  getControl(controlName: string): FormControl {
    return this.form.get(controlName) as FormControl;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  clearError(field: string) {
    if (field === 'email') this.emailError = '';
    if (field === 'password') this.passwordError = '';
  }

  async onSubmit() {
    this.form.markAllAsTouched();

    const isEmailValid = this.validateEmail();
    const isPasswordValid = this.validatePassword();
    if (!isEmailValid || !isPasswordValid) return;

    this.loading = true;

    const { email, password } = this.form.value;

    try {
      const success = await this.authService.login(email, password);

      if (success) {
        this.showSuccess = true;

        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 2000);
      }
    } catch (error: any) {
      this.passwordError = error.message || 'Login failed';
    } finally {
      this.loading = false;
    }
  }

  validateEmail() {
    const control = this.form.get('email');
    if (!control) return false;

    if (control.errors) {
      const key = Object.keys(control.errors)[0];
      const value = control.errors[key];

      this.emailError =
        this.inputConfigs.email.customErrorMessages?.[key] ||
        this.validatorsService.getDefaultErrorMessage(
          key,
          value,
          this.inputConfigs.email
        );

      return false;
    }

    this.emailError = '';
    return true;
  }

  validatePassword() {
    const control = this.form.get('password');
    if (!control) return false;

    if (control.errors) {
      const key = Object.keys(control.errors)[0];
      const value = control.errors[key];

      this.passwordError =
        this.inputConfigs.password.customErrorMessages?.[key] ||
        this.validatorsService.getDefaultErrorMessage(
          key,
          value,
          this.inputConfigs.password
        );

      return false;
    }

    this.passwordError = '';
    return true;
  }

  recover() {
    this.router.navigate(['/forgot-password']);
  }

  signup() {
    this.router.navigate(['/signup']);
  }

  toggleDarkMode(): void {
    this.themeService.toggleTheme();
    this.darkMode = this.themeService.isDarkTheme();
  }
}