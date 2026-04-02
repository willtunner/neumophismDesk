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
  selector: 'app-company-modal',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TranslateModule, 
    InputDynamicComponent, 
    MatButtonModule
  ],
  templateUrl: './create-company-modal.html',
  styleUrls: ['./create-company-modal.css']
})
export class CompanyModalComponent implements OnInit {
  companyForm!: FormGroup;

  nameConfig!: InputConfig;
  cnpjConfig!: InputConfig;
  cityConfig!: InputConfig;
  stateConfig!: InputConfig;
  addressConfig!: InputConfig;
  zipcodeConfig!: InputConfig;
  phoneConfig!: InputConfig;
  connectionServConfig!: InputConfig;
  emailConfig!: InputConfig;
  versionServConfig!: InputConfig;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CompanyModalComponent>,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      cnpj: ['', Validators.required],
      city: [''],
      state: [''],
      address: [''],
      zipcode: [''],
      phone: [''],
      connectionServ: [''],
      email: ['', Validators.email],
      versionServ: ['']
    });

    this.initConfigs();
  }

  initConfigs() {
    this.nameConfig = {
      type: InputType.TEXT,
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
    this.cnpjConfig = {
      type: InputType.TEXT,
      formControlName: 'cnpj',
      label: this.translate.instant('INPUTS_FIELDS.CNPJ'),
      required: true,
      minLength: 2,
      maxLength: 100,
      placeholder: this.translate.instant('INPUTS_FIELDS.PLACEHOLDER_CNPJ'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR_ERROR_MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MAXLENGTH', { requiredLength: 100 }),
      },
    };
    this.cityConfig = {
      type: InputType.TEXT,
      formControlName: 'city',
      label: this.translate.instant('INPUTS_FIELDS.CITY'),
      required: true,
      minLength: 2,
      maxLength: 100,
      placeholder: this.translate.instant('INPUTS_FIELDS.PLACEHOLDER_CITY'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR_ERROR_MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MAXLENGTH', { requiredLength: 100 }),
      },
    };
    this.stateConfig = {
      type: InputType.TEXT,
      formControlName: 'state',
      label: this.translate.instant('INPUTS_FIELDS.STATE'),
      required: true,
      minLength: 2,
      maxLength: 100,
      placeholder: this.translate.instant('INPUTS_FIELDS.PLACEHOLDER_STATE'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR_ERROR_MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MAXLENGTH', { requiredLength: 100 }),
      },
    };
    this.addressConfig = {
      type: InputType.TEXT,
      formControlName: 'address',
      label: this.translate.instant('INPUTS_FIELDS.ADDRESS'),
      required: true,
      minLength: 2,
      maxLength: 100,
      placeholder: this.translate.instant('INPUTS_FIELDS.PLACEHOLDER_ADDRESS'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR_ERROR_MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MAXLENGTH', { requiredLength: 100 }),
      },
    };
    this.zipcodeConfig = {
      type: InputType.TEXT,
      formControlName: 'zipcode',
      label: this.translate.instant('INPUTS_FIELDS.ZIP_CODE'),
      required: true,
      minLength: 2,
      maxLength: 100,
      placeholder: this.translate.instant('INPUTS_FIELDS.PLACEHOLDER_ZIP_CODE'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR_ERROR_MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MAXLENGTH', { requiredLength: 100 }),
      },
    };
    this.phoneConfig = {
      type: InputType.TEXT,
      formControlName: 'phone',
      label: this.translate.instant('INPUTS_FIELDS.PHONE'),
      required: true,
      minLength: 2,
      maxLength: 100,
      placeholder: this.translate.instant('INPUTS_FIELDS.PLACEHOLDER_PHONE'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR_ERROR_MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MAXLENGTH', { requiredLength: 100 }),
      },
    };
    this.connectionServConfig = {
      type: InputType.TEXT,
      formControlName: 'connectionServ',
      label: this.translate.instant('INPUTS_FIELDS.CONECTION'),
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
    this.emailConfig = {
      type: InputType.TEXT,
      formControlName: 'email',
      label: this.translate.instant('INPUTS_FIELDS.EMAIL'),
      required: true,
      minLength: 2,
      maxLength: 100,
      placeholder: this.translate.instant('INPUTS_FIELDS.PLACEHOLDER_EMAIL'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR_ERROR_MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MAXLENGTH', { requiredLength: 100 }),
      },
    };
    this.versionServConfig = {
      type: InputType.TEXT,
      formControlName: 'versionServ',
      label: this.translate.instant('INPUTS_FIELDS.VERSION_SERV'),
      required: true,
      minLength: 2,
      maxLength: 100,
      placeholder: this.translate.instant('INPUTS_FIELDS.PLACEHOLDER_VERSION_SERV'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR_ERROR_MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MAXLENGTH', { requiredLength: 100 }),
      },
    };
  }

  onSave() {
    if (this.companyForm.valid) {
      this.dialogRef.close(this.companyForm.value);
    } else {
      this.companyForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.dialogRef.close();
  }


  getControl(name: string) {
      return this.companyForm.get(name) as FormControl;
    }
}
