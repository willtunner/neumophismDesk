import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputDynamicComponent } from '../../../shared/components/input-dynamic/input-dynamic';
import { InputConfig } from '../../../interfaces/input-config.interface';
import { InputType } from '../../../enuns/input-types.enum';

@Component({
  selector: 'app-company-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, InputDynamicComponent],
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
      label: this.translate.instant('CALENDAR.CALENDAR_TITLE'), //* mudar para nome
      required: true,
      minLength: 2,
      maxLength: 100,
      placeholder: this.translate.instant('CALENDAR.PLACEHOLDER_TITLE'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR-ERROR-MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MAXLENGTH', { requiredLength: 100 }),
      },
    };
    this.cnpjConfig = {
      type: InputType.TEXT,
      formControlName: 'cnpj',
      label: this.translate.instant('CALENDAR.CALENDAR_TITLE'),
      required: true,
      minLength: 2,
      maxLength: 100,
      placeholder: this.translate.instant('CALENDAR.PLACEHOLDER_TITLE'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR-ERROR-MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MAXLENGTH', { requiredLength: 100 }),
      },
    };
    this.cityConfig = {
      type: InputType.TEXT,
      formControlName: 'city',
      label: this.translate.instant('CALENDAR.CALENDAR_TITLE'),
      required: true,
      minLength: 2,
      maxLength: 100,
      placeholder: this.translate.instant('CALENDAR.PLACEHOLDER_TITLE'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR-ERROR-MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MAXLENGTH', { requiredLength: 100 }),
      },
    };
    this.stateConfig = {
      type: InputType.TEXT,
      formControlName: 'state',
      label: this.translate.instant('CALENDAR.CALENDAR_TITLE'),
      required: true,
      minLength: 2,
      maxLength: 100,
      placeholder: this.translate.instant('CALENDAR.PLACEHOLDER_TITLE'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR-ERROR-MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MAXLENGTH', { requiredLength: 100 }),
      },
    };
    this.addressConfig = {
      type: InputType.TEXT,
      formControlName: 'address',
      label: this.translate.instant('CALENDAR.CALENDAR_TITLE'),
      required: true,
      minLength: 2,
      maxLength: 100,
      placeholder: this.translate.instant('CALENDAR.PLACEHOLDER_TITLE'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR-ERROR-MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MAXLENGTH', { requiredLength: 100 }),
      },
    };
    this.zipcodeConfig = {
      type: InputType.TEXT,
      formControlName: 'zipcode',
      label: this.translate.instant('CALENDAR.CALENDAR_TITLE'),
      required: true,
      minLength: 2,
      maxLength: 100,
      placeholder: this.translate.instant('CALENDAR.PLACEHOLDER_TITLE'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR-ERROR-MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MAXLENGTH', { requiredLength: 100 }),
      },
    };
    this.phoneConfig = {
      type: InputType.TEXT,
      formControlName: 'phone',
      label: this.translate.instant('CALENDAR.CALENDAR_TITLE'),
      required: true,
      minLength: 2,
      maxLength: 100,
      placeholder: this.translate.instant('CALENDAR.PLACEHOLDER_TITLE'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR-ERROR-MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MAXLENGTH', { requiredLength: 100 }),
      },
    };
    this.connectionServConfig = {
      type: InputType.TEXT,
      formControlName: 'connectionServ',
      label: this.translate.instant('CALENDAR.CALENDAR_TITLE'),
      required: true,
      minLength: 2,
      maxLength: 100,
      placeholder: this.translate.instant('CALENDAR.PLACEHOLDER_TITLE'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR-ERROR-MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MAXLENGTH', { requiredLength: 100 }),
      },
    };
    this.emailConfig = {
      type: InputType.TEXT,
      formControlName: 'email',
      label: this.translate.instant('CALENDAR.CALENDAR_TITLE'),
      required: true,
      minLength: 2,
      maxLength: 100,
      placeholder: this.translate.instant('CALENDAR.PLACEHOLDER_TITLE'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR-ERROR-MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MAXLENGTH', { requiredLength: 100 }),
      },
    };
    this.versionServConfig = {
      type: InputType.TEXT,
      formControlName: 'versionServ',
      label: this.translate.instant('CALENDAR.CALENDAR_TITLE'),
      required: true,
      minLength: 2,
      maxLength: 100,
      placeholder: this.translate.instant('CALENDAR.PLACEHOLDER_TITLE'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR-ERROR-MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MAXLENGTH', { requiredLength: 100 }),
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
