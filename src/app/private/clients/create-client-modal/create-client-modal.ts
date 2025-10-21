import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputDynamicComponent } from '../../../shared/components/input-dynamic/input-dynamic';
import { InputConfig } from '../../../interfaces/input-config.interface';
import { InputType } from '../../../enuns/input-types.enum';

@Component({
  selector: 'app-client-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, InputDynamicComponent],
  templateUrl: './create-client-modal.html',
  styleUrls: ['./create-client-modal.css']
})
export class ClientModalComponent implements OnInit {
  clientForm!: FormGroup;

  usernameConfig!: InputConfig;
  nameConfig!: InputConfig;
  phoneConfig!: InputConfig;
  emailConfig!: InputConfig;
  passwordConfig!: InputConfig;
  imageUrlConfig!: InputConfig;
  connectionConfig!: InputConfig;

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
      connection: ['']
    });

    this.initConfigs();
  }

  initConfigs() {
    this.usernameConfig = {
      type: InputType.TEXT,
      formControlName: 'username',
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
    this.phoneConfig = {
      type: InputType.TEXT,
      formControlName: 'phone',
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
    this.emailConfig = {
      type: InputType.TEXT,
      formControlName: 'email',
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
    this.passwordConfig = {
      type: InputType.TEXT,
      formControlName: 'password',
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
    this.imageUrlConfig = {
      type: InputType.TEXT,
      formControlName: 'imageUrl',
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
    this.connectionConfig = {
      type: InputType.TEXT,
      formControlName: 'connection',
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
  }

  onSave() {
    if (this.clientForm.valid) {
      this.dialogRef.close(this.clientForm.value);
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
}
