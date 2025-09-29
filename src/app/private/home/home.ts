// home.component.ts (atualizado)
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme';
import { InputDynamicComponent } from '../../shared/components/input-dynamic/input-dynamic';
import { InputType } from '../../enuns/input-types.enum';
import { InputConfig } from '../../interfaces/input-config.interface';
import { InputValidatorsService } from '../../services/input-validators';
import { CheckboxDynamic } from '../../shared/components/checkbox-dynamic/checkbox-dynamic';
import { CheckboxConfig } from '../../interfaces/checkbox-config.interface';
import { CheckboxLayout, CheckboxSelection } from '../../enuns/checkbox-types.enum';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputDynamicComponent, CheckboxDynamic],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {


  checkboxConfig: CheckboxConfig = {
    formControlName: 'checkboxSelection',
    label: 'Choose your preferences',
    layout: CheckboxLayout.VERTICAL,
    selection: CheckboxSelection.MULTIPLE,
    options: [
      { value: 'newsletter', label: 'Subscribe to newsletter' },
      { value: 'terms', label: 'Accept terms and conditions' },
      { value: 'notifications', label: 'Enable notifications' }
    ]
  };



  // Formulário reativo para os inputs dinâmicos
  dynamicForm: FormGroup;

  // Dados para o formulário template-driven original
  formData = {
    fullName: '',
    email: '',
    age: null as number | null,
    country: '',
    bio: '',
    newsletter: false,
    terms: false,
    notifications: true,
    gender: '',
    volume: 50,
    brightness: 75,
    darkMode: false,
    autoSave: true,
    publicProfile: false
  };

  // Configurações para os inputs dinâmicos - ATUALIZADO
  inputConfigs = {
    // Para a seção "Dynamic Inputs"
    dynamicFullName: {
      type: InputType.USER,
      formControlName: 'dynamicFullName',
      label: 'Full Name',
      required: true,
      minLength: 2,
      maxLength: 50,
      placeholder: 'Enter your full name',
      customErrorMessages: {
        required: 'Please enter your full name',
        minlength: 'Name must be at least 2 characters long'
      }
    } as InputConfig,
    dynamicEmail: {
      type: InputType.EMAIL,
      formControlName: 'dynamicEmail', 
      label: 'Email Address',
      required: true,
      placeholder: 'Enter your email address',
      customErrorMessages: {
        required: 'Email is required',
        pattern: 'Please enter a valid email address'
      }
    } as InputConfig,
    dynamicAge: {
      type: InputType.NUMBER,
      formControlName: 'dynamicAge',
      label: 'Age',
      required: false,
      min: 0,
      max: 120,
      placeholder: 'Enter your age',
      customErrorMessages: {
        min: 'Age cannot be negative',
        max: 'Age cannot be more than 120'
      }
    } as InputConfig,
    dynamicBio: {
      type: InputType.TEXTAREA,
      formControlName: 'dynamicBio',
      label: 'Bio',
      required: false,
      rows: 4,
      maxLength: 500,
      placeholder: 'Tell us about yourself',
      customErrorMessages: {
        maxlength: 'Bio cannot exceed 500 characters'
      }
    } as InputConfig,

    // NOVOS: Para a seção "Text Inputs" (substituindo os inputs originais)
    originalFullName: {
      type: InputType.USER,
      formControlName: 'originalFullName',
      label: 'Full Name',
      required: true,
      minLength: 2,
      maxLength: 50,
      placeholder: 'Enter your full name',
      customErrorMessages: {
        required: 'Full name is required',
        minlength: 'Full name must be at least 2 characters'
      }
    } as InputConfig,
    originalEmail: {
      type: InputType.EMAIL,
      formControlName: 'originalEmail', 
      label: 'Email Address',
      required: true,
      placeholder: 'Enter your email address',
      customErrorMessages: {
        required: 'Email address is required',
        pattern: 'Please enter a valid email address'
      }
    } as InputConfig
  };

  constructor(
    private router: Router, 
    private themeService: ThemeService,
    private fb: FormBuilder,
    private validatorsService: InputValidatorsService
  ) {
    // Inicializa o formulário reativo com TODOS os controles usando o serviço
    this.dynamicForm = this.fb.group({
      dynamicFullName: ['', this.validatorsService.getDefaultValidators(InputType.USER, this.inputConfigs.dynamicFullName)],
      dynamicEmail: ['', this.validatorsService.getDefaultValidators(InputType.EMAIL, this.inputConfigs.dynamicEmail)],
      dynamicAge: [null, this.validatorsService.getDefaultValidators(InputType.NUMBER, this.inputConfigs.dynamicAge)],
      dynamicBio: ['', this.validatorsService.getDefaultValidators(InputType.TEXTAREA, this.inputConfigs.dynamicBio)],
      originalFullName: ['', this.validatorsService.getDefaultValidators(InputType.USER, this.inputConfigs.originalFullName)],
      originalEmail: ['', this.validatorsService.getDefaultValidators(InputType.EMAIL, this.inputConfigs.originalEmail)]
    });
  
    // Sincroniza o tema dark mode
    this.formData.darkMode = this.themeService.isDarkTheme();
  }

  // Método auxiliar para obter o FormControl
  getControl(controlName: string): FormControl {
    return this.dynamicForm.get(controlName) as FormControl;
  }

  // Submissão do formulário dinâmico (seção Dynamic Inputs)
  submitDynamicForm() {
    if (this.dynamicForm.valid) {
      console.log('Dynamic Form submitted:', {
        dynamicFullName: this.dynamicForm.value.dynamicFullName,
        dynamicEmail: this.dynamicForm.value.dynamicEmail,
        dynamicAge: this.dynamicForm.value.dynamicAge,
        dynamicBio: this.dynamicForm.value.dynamicBio
      });
      alert('Dynamic form data saved! Check console for details.');
    } else {
      this.dynamicForm.markAllAsTouched();
      alert('Please fix the errors in the dynamic form.');
    }
  }

  // Submissão do formulário original (seção Text Inputs)
  submitOriginalForm() {
    if (this.dynamicForm.valid) {
      console.log('Original Form submitted:', {
        originalFullName: this.dynamicForm.value.originalFullName,
        originalEmail: this.dynamicForm.value.originalEmail
      });
      alert('Original form data saved! Check console for details.');
    } else {
      this.dynamicForm.markAllAsTouched();
      alert('Please fix the errors in the original form.');
    }
  }

  // Submissão do formulário template-driven (mantido para compatibilidade)
  submitForm() {
    console.log('Template Form submitted:', this.formData);
    alert('Template form data saved! Check console for details.');
  }

  resetForm() {
    // Reseta formulário template-driven
    this.formData = {
      fullName: '',
      email: '',
      age: null,
      country: '',
      bio: '',
      newsletter: false,
      terms: false,
      notifications: true,
      gender: '',
      volume: 50,
      brightness: 75,
      darkMode: this.formData.darkMode,
      autoSave: true,
      publicProfile: false
    };
    
    // Reseta formulário reativo
    this.dynamicForm.reset();
    console.log('All forms reset');
  }

  showAlert() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion requested!');
    }
  }

  logout() {
    this.router.navigate(['/login']);
  }

  submitCheckboxForm() {
    console.log('Selected options:', this.dynamicForm.value.checkboxSelection);
  }

  toggleDarkMode(): void {
    this.themeService.toggleTheme();
    this.formData.darkMode = this.themeService.isDarkTheme();
  }
}