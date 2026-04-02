import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputDynamicComponent } from '../../../shared/components/input-dynamic/input-dynamic';
import { InputConfig } from '../../../interfaces/input-config.interface';
import { InputType } from '../../../enuns/input-types.enum';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-client-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, InputDynamicComponent, MatButtonModule],
  templateUrl: './create-client-modal.html',
  styleUrls: ['./create-client-modal.css']
})
export class ClientModalComponent implements OnInit {
  clientForm!: FormGroup;
  submitted = false;

  usernameConfig!: InputConfig;
  nameConfig!: InputConfig;
  phoneConfig!: InputConfig;
  emailConfig!: InputConfig;
  passwordConfig!: InputConfig;
  imageUrlConfig!: InputConfig;
  connectionConfig!: InputConfig;
  companyInfoConfig!: InputConfig; // Novo config para mostrar a empresa

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ClientModalComponent>,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.clientForm = this.fb.group({
      username: ['', Validators.required],
      name: ['', Validators.required],
      phone: [''],
      email: ['', Validators.email],
      password: ['', Validators.required],
      imageUrl: [''],
      connection: [''],
      companyId: [this.data?.selectedCompany?.id || '', Validators.required] // Adiciona o companyId
    });

    this.initConfigs();
  }

  initConfigs() {
    // Configuração para mostrar a empresa selecionada (campo somente leitura)
    this.companyInfoConfig = {
      type: InputType.TEXT,
      formControlName: 'companyInfo',
      label: this.translate.instant('INPUTS_FIELDS.COMPANY'),
      required: true,
      placeholder: this.translate.instant('INPUTS_FIELDS.PLACEHOLDER_COMPANY'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR_ERROR_MESSAGES.REQUIRED'),
      },
    };

    this.usernameConfig = {
      type: InputType.USER,
      formControlName: 'username',
      label: this.translate.instant('INPUTS_FIELDS.USERNAME'), 
      required: true,
      minLength: 2,
      maxLength: 100,
      placeholder: this.translate.instant('INPUTS_FIELDS.PLACEHOLDER_USERNAME'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR_ERROR_MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MAXLENGTH', { requiredLength: 100 }),
      },
    };

    this.nameConfig = {
      type: InputType.USER,
      formControlName: 'name',
      label: this.translate.instant('INPUTS_FIELDS.FIRST_NAME'), 
      required: true,
      minLength: 2,
      maxLength: 100,
      placeholder: this.translate.instant('INPUTS_FIELDS.PLACEHOLDER_NAME'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR_ERROR_MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MAXLENGTH', { requiredLength: 100 }),
      },
    };

    this.phoneConfig = {
      type: InputType.PHONE,
      formControlName: 'phone',
      label: this.translate.instant('INPUTS_FIELDS.PHONE'),
      required: true,
      minLength: 11,
      placeholder: this.translate.instant('INPUTS_FIELDS.PLACEHOLDER_PHONE'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR_ERROR_MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MINLENGTH', { requiredLength: 11 }),
      },
    };

    this.emailConfig = {
      type: InputType.EMAIL,
      formControlName: 'email',
      label: this.translate.instant('INPUTS_FIELDS.EMAIL'),
      required: true,
      minLength: 5,
      maxLength: 264,
      placeholder: this.translate.instant('INPUTS_FIELDS.PLACEHOLDER_EMAIL'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR_ERROR_MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MAXLENGTH', { requiredLength: 264 }),
      },
    };

    this.passwordConfig = {
      type: InputType.PASSWORD,
      formControlName: 'password',
      label: this.translate.instant('INPUTS_FIELDS.PASSWORD'),
      required: true,
      minLength: 6,
      placeholder: this.translate.instant('INPUTS_FIELDS.PLACEHOLDER_PASSWORD'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR_ERROR_MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MINLENGTH', { requiredLength: 6 }),
      },
    };

    this.imageUrlConfig = {
      type: InputType.IMAGE,
      formControlName: 'imageUrl',
      label: this.translate.instant('INPUTS_FIELDS.URL_IMG'),
      required: true,
      minLength: 2,
      maxLength: 100,
      placeholder: this.translate.instant('INPUTS_FIELDS.URL_IMG'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR_ERROR_MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MAXLENGTH', { requiredLength: 100 }),
      },
    };

    this.connectionConfig = {
      type: InputType.CONNECTION,
      formControlName: 'connection',
      label: this.translate.instant('CLIENTS.FIELDS.CONNECTION'),
      required: true,
      minLength: 2,
      maxLength: 100,
      placeholder: this.translate.instant('INPUTS_FIELDS.PLACEHOLDER_CONECTION'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR_ERROR_MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MAXLENGTH', { requiredLength: 100 }),
      },
    };
  }

  onSave() {
    this.submitted = true;
    if (this.clientForm.valid) {
      // Garante que o companyId está incluído nos dados
      const clientData = {
        ...this.clientForm.value,
        companyId: this.data?.selectedCompany?.id // Garante o companyId
      };
      this.dialogRef.close(clientData);
    } else {
      this.clientForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  getControl(name: string) {
    return this.clientForm.get(name) as FormControl;
  }

  // Método para obter o controle do campo de informação da empresa
  getCompanyInfoControl() {
    return new FormControl({
      value: this.data?.selectedCompany?.name || '',
      disabled: true
    });
  }
}