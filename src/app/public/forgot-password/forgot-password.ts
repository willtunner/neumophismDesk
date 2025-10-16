import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private translate = inject(TranslateService);

  forgotPasswordForm: FormGroup;
  isLoading = false;
  emailSent = false;
  countdown = 60;
  countdownActive = false;

  constructor() {
    this.forgotPasswordForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      
      // Simula o envio do email
      setTimeout(() => {
        const email = this.forgotPasswordForm.get('email')?.value;
        
        // Print no console como solicitado
        console.log('📧 Email de recuperação enviado para:', email);
        console.log('⏰ Timestamp:', new Date().toLocaleString('pt-BR'));
        
        this.isLoading = false;
        this.emailSent = true;
        this.startCountdown();
        
      }, 2000);
    } else {
      this.markFormGroupTouched();
    }
  }

  private startCountdown() {
    this.countdownActive = true;
    this.countdown = 60;
    
    const interval = setInterval(() => {
      this.countdown--;
      
      if (this.countdown <= 0) {
        clearInterval(interval);
        this.countdownActive = false;
      }
    }, 1000);
  }

  resendEmail() {
    if (!this.countdownActive) {
      this.onSubmit();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.forgotPasswordForm.controls).forEach(key => {
      const control = this.forgotPasswordForm.get(key);
      control?.markAsTouched();
    });
  }

  get formControls() {
    return this.forgotPasswordForm.controls;
  }

  formatCountdown(): string {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}