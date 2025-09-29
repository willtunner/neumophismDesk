import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  form: FormGroup;
  showPassword = false;
  loading = false;
  showSuccess = false;
  emailError = '';
  passwordError = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  validateEmail() {
    const email = this.form.get('email')?.value?.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      this.emailError = 'Email is required';
      return false;
    }
    
    if (!emailRegex.test(email)) {
      this.emailError = 'Please enter a valid email';
      return false;
    }
    
    this.emailError = '';
    return true;
  }

  validatePassword() {
    const password = this.form.get('password')?.value;
    
    if (!password) {
      this.passwordError = 'Password is required';
      return false;
    }
    
    if (password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
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
    if (this.form.invalid) return;

    const isEmailValid = this.validateEmail();
    const isPasswordValid = this.validatePassword();
    
    if (!isEmailValid || !isPasswordValid) return;

    this.loading = true;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { email, password, remember } = this.form.value;
      console.log('Login successful:', { email, password, remember });
      
      // Navigate to home page
      this.router.navigate(['/home']);
      
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