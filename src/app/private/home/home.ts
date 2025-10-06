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
import { RichTextDynamicComponent } from '../../shared/components/rich-text-dynamic/rich-text-dynamic';
import { RichTextConfig } from '../../interfaces/rich-text-config.interface';
import { StatusCards } from '../../shared/components/status-cards/status-cards';
import { LineChart } from '../../shared/components/line-chart/line-chart';
import { PieChart } from '../../shared/components/pie-chart/pie-chart';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BarChartDrilldown } from '../../shared/components/bar-chart-drilldown/bar-chart-drilldown';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    InputDynamicComponent, 
    CheckboxDynamic,
    RichTextDynamicComponent,
    StatusCards,
    LineChart,
    PieChart,
    TranslateModule,
    BarChartDrilldown
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {

  isMenuOpen = false;

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

  // Configurações para os inputs dinâmicos
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

    // Para a seção "Text Inputs" (substituindo os inputs originais)
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
    } as InputConfig,

    // Para substituir os inputs originais de Number & Select
    ageInput: {
      type: InputType.NUMBER,
      formControlName: 'ageInput',
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
    countrySelect: {
      type: InputType.TEXT,
      formControlName: 'countrySelect',
      label: 'Country',
      required: false,
      placeholder: 'Select your country',
      customIcon: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9v-9m0-9v9"/>
        </svg>
      `
    } as InputConfig,
    bioTextarea: {
      type: InputType.TEXTAREA,
      formControlName: 'bioTextarea',
      label: 'Bio',
      required: false,
      rows: 4,
      maxLength: 500,
      placeholder: 'Tell us about yourself',
      customErrorMessages: {
        maxlength: 'Bio cannot exceed 500 characters'
      }
    } as InputConfig
  };

  // NOVO: Configurações para Rich Text Editors
richTextConfigs = {
  basicEditor: {
    type: 'rich-text',
    formControlName: 'basicEditor',
    label: 'Basic Description',
    required: true,
    placeholder: 'Write a basic description here...',
    minLength: 20,
    maxLength: 500,
    minHeight: '200px',
    customErrorMessages: {
      required: 'Description is required',
      minlength: 'Description must be at least 20 characters',
      maxlength: 'Description cannot exceed 500 characters'
    }
  } as RichTextConfig,
  advancedEditor: {
    type: 'rich-text',
    formControlName: 'advancedEditor',
    label: 'Advanced Content',
    required: false,
    placeholder: 'Write your advanced content here...',
    minLength: 20,
    maxLength: 2000,
    toolbar: 'full',
    theme: 'snow',
    height: 300,
    minHeight: '300px',
    customErrorMessages: {
      minlength: 'Content must be at least 20 characters',
      maxlength: 'Content cannot exceed 2000 characters'
    }
  } as RichTextConfig
};

  constructor(
    private router: Router, 
    private themeService: ThemeService,
    private fb: FormBuilder,
    private validatorsService: InputValidatorsService,
    private translate: TranslateService
  ) {
    // Inicializa o formulário reativo com TODOS os controles
    this.dynamicForm = this.fb.group({
      // Inputs dinâmicos existentes
      dynamicFullName: ['', this.validatorsService.getDefaultValidators(InputType.USER, this.inputConfigs.dynamicFullName)],
      dynamicEmail: ['', this.validatorsService.getDefaultValidators(InputType.EMAIL, this.inputConfigs.dynamicEmail)],
      dynamicAge: [null, this.validatorsService.getDefaultValidators(InputType.NUMBER, this.inputConfigs.dynamicAge)],
      dynamicBio: ['', this.validatorsService.getDefaultValidators(InputType.TEXTAREA, this.inputConfigs.dynamicBio)],
      originalFullName: ['', this.validatorsService.getDefaultValidators(InputType.USER, this.inputConfigs.originalFullName)],
      originalEmail: ['', this.validatorsService.getDefaultValidators(InputType.EMAIL, this.inputConfigs.originalEmail)],
      ageInput: [null, this.validatorsService.getDefaultValidators(InputType.NUMBER, this.inputConfigs.ageInput)],
      countrySelect: ['', this.validatorsService.getDefaultValidators(InputType.TEXT, this.inputConfigs.countrySelect)],
      bioTextarea: ['', this.validatorsService.getDefaultValidators(InputType.TEXTAREA, this.inputConfigs.bioTextarea)],
      
      // NOVOS: Rich Text Editors
      basicEditor: [''],
      advancedEditor: ['']
    });
  
    // Sincroniza o tema dark mode
    this.formData.darkMode = this.themeService.isDarkTheme();

    // Sincroniza os valores do formulário reativo com o template-driven
    this.setupFormSync();
  }

  // Método para sincronizar os formulários
  private setupFormSync(): void {
    // Sincroniza age
    this.dynamicForm.get('ageInput')?.valueChanges.subscribe(value => {
      this.formData.age = value;
    });

    // Sincroniza country
    this.dynamicForm.get('countrySelect')?.valueChanges.subscribe(value => {
      this.formData.country = value;
    });

    // Sincroniza bio
    this.dynamicForm.get('bioTextarea')?.valueChanges.subscribe(value => {
      this.formData.bio = value;
    });

    // Sincroniza valores iniciais
    if (this.formData.age) {
      this.dynamicForm.get('ageInput')?.setValue(this.formData.age);
    }
    if (this.formData.country) {
      this.dynamicForm.get('countrySelect')?.setValue(this.formData.country);
    }
    if (this.formData.bio) {
      this.dynamicForm.get('bioTextarea')?.setValue(this.formData.bio);
    }
  }

  // Método auxiliar para obter o FormControl
  getControl(controlName: string): FormControl {
    return this.dynamicForm.get(controlName) as FormControl;
  }

  // NOVO: Método para preview do rich text
  getRichTextPreview(): string {
    const basicContent = this.dynamicForm.value.basicEditor;
    const advancedContent = this.dynamicForm.value.advancedEditor;
    
    if (basicContent || advancedContent) {
      return `
        <div class="preview-content">
          ${basicContent ? `<h4>Basic Editor:</h4><div>${basicContent}</div>` : ''}
          ${advancedContent ? `<h4>Advanced Editor:</h4><div>${advancedContent}</div>` : ''}
        </div>
      `;
    }
    return '<p>No rich text content yet.</p>';
  }

  

  // NOVO: Submissão do formulário Rich Text
  submitRichTextForm() {
    const basicControl = this.getControl('basicEditor');
    
    if (basicControl.valid) {
      console.log('Rich Text submitted:', {
        basicContent: this.dynamicForm.value.basicEditor
      });
      alert('Rich text content saved! Check console for details.');
    } else {
      basicControl.markAsTouched();
      alert('Please fix the errors in the rich text editor.');
    }
  }

  // NOVO: Submissão do formulário Advanced Rich Text
  submitAdvancedRichTextForm() {
    const advancedControl = this.getControl('advancedEditor');
    
    if (advancedControl.valid) {
      console.log('Advanced Rich Text submitted:', {
        advancedContent: this.dynamicForm.value.advancedEditor
      });
      alert('Advanced rich text content saved! Check console for details.');
    } else {
      advancedControl.markAsTouched();
      alert('Please fix the errors in the advanced rich text editor.');
    }
  }

  // Métodos existentes...
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

  

  submitCheckboxForm() {
    console.log('Selected options:', this.dynamicForm.value.checkboxSelection);
  }

  toggleDarkMode(): void {
    this.themeService.toggleTheme();
    this.formData.darkMode = this.themeService.isDarkTheme();
  }

 
}