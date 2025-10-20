import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { User } from '../../../models/models';

@Injectable({ providedIn: 'root' })
export class CallFormBuilderService {
  constructor(private fb: FormBuilder) {}

  createForm(loggedUser: User): FormGroup {
    return this.fb.group({
      companyId: ['', Validators.required],
      clientId: ['', Validators.required],
      helpDeskCompanyId: [loggedUser.helpDeskCompanyId, Validators.required],
      operatorId: [loggedUser.id, Validators.required],
      connection: [''],
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      resolution: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(5000)]],
      tags: [[], Validators.required],
    });
  }
}
