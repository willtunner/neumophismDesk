import { Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

// Importe seus componentes e interfaces
import { InputConfig } from '../../../interfaces/input-config.interface';
import { InputType } from '../../../enuns/input-types.enum';
import { InputDynamicComponent } from '../../../shared/components/input-dynamic/input-dynamic';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
}

export interface EventModalData {
  date: Date;
  event: CalendarEvent | null;
  isEdit: boolean;
}

@Component({
  selector: 'app-event-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    InputDynamicComponent,
    TranslateModule
  ],
  templateUrl: './event-modal.html',
  styleUrls: ['./event-modal.css']
})
export class EventModalComponent implements OnInit {
  eventForm!: FormGroup;
  private fb = inject(FormBuilder);
  titleInputConfig!: InputConfig;
  descriptionInputConfig!: InputConfig;

  constructor(
    public dialogRef: MatDialogRef<EventModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EventModalData,
    private translate: TranslateService
  ) { }
  

  

  ngOnInit(): void {
    this.initializeForm();
    this.initializeInputConfigs();

    this.translate.onLangChange.subscribe(() => {
      this.updateTranslations();
    });
  }

  private initializeInputConfigs(): void {
    this.titleInputConfig = {
      type: InputType.TEXT,
      formControlName: 'title',
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
      customIcon: `
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6z" />
          <polyline points="12,2 12,6 16,6" />
          <line x1="13" y1="11" x2="7" y2="11" />
          <line x1="13" y1="14" x2="7" y2="14" />
        </svg>
      `
    };

    this.descriptionInputConfig = {
      type: InputType.TEXTAREA,
      formControlName: 'description',
      label: this.translate.instant('CALENDAR.DESCRIPTION'),
      required: true,
      rows: 4,
      maxLength: 500,
      placeholder: this.translate.instant('CALENDAR.PLACEHOLDER_DESCRIPTION'),
      customErrorMessages: {
        required: this.translate.instant('VALIDATOR-ERROR-MESSAGES.REQUIRED'),
        minlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MINLENGTH', { requiredLength: 2 }),
        maxlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MAXLENGTH', { requiredLength: 100 }),
      },
      customIcon: `
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M17 12a2 2 0 0 1-2 2H5l-3 3V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" />
        </svg>
      `
    };
  }

  private updateTranslations(): void {
    this.titleInputConfig.customErrorMessages = {
      required: this.translate.instant('VALIDATOR-ERROR-MESSAGES.REQUIRED'),
      minlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MINLENGTH', { requiredLength: 2 }),
      maxlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MAXLENGTH', { requiredLength: 100 }),
    };
  
    this.descriptionInputConfig.customErrorMessages = {
      required: this.translate.instant('VALIDATOR-ERROR-MESSAGES.REQUIRED'),
      maxlength: this.translate.instant('VALIDATOR-ERROR-MESSAGES.MAXLENGTH', { requiredLength: 500 }),
    };
  }

  private initializeForm(): void {
    this.eventForm = this.fb.group({
      title: [
        this.data.isEdit && this.data.event ? this.data.event.title : '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
      ],
      description: [
        this.data.isEdit && this.data.event ? this.data.event.description : '',
        [Validators.maxLength(500)]
      ]
    });
  }

  saveEvent(): void {
    if (this.eventForm.invalid || !this.titleControl?.value?.trim()) {
      // Marca todos os campos como touched para mostrar erros
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.eventForm.value;

    const event: CalendarEvent = {
      id: this.data.isEdit && this.data.event ? this.data.event.id : this.generateId(),
      date: this.data.date,
      title: formValue.title.trim(),
      description: formValue.description?.trim() || ''
    };

    this.dialogRef.close(event);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.eventForm.controls).forEach(key => {
      const control = this.eventForm.get(key);
      control?.markAsTouched();
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Getters para facilitar o acesso no template com type casting
  get titleControl(): FormControl {
    return this.eventForm.get('title') as FormControl;
  }

  get descriptionControl(): FormControl {
    return this.eventForm.get('description') as FormControl;
  }
}