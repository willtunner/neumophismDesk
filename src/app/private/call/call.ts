import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { SelectDynamicComponent } from '../../shared/components/select-dynamic/select-dynamic';
import { InputDynamicComponent } from '../../shared/components/input-dynamic/input-dynamic';
import { ButtonDynamic } from '../../shared/components/button-dynamic/button-dynamic';
import { RichTextDynamicComponent } from '../../shared/components/rich-text-dynamic/rich-text-dynamic';
import { TagsNeuComponent } from '../../shared/components/tags-neu/tags-neu';

import { Company, User } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { CallCompanyLoaderService } from './util/call-company-loader.service';
import { CallClientLoaderService } from './util/call-client-loader.service';
import { CallFormBuilderService } from './util/call-form-builder.service';
import { buildInputConfigs } from './util/call-input-config.factory';
import { buildSelectConfigs } from './util/call-select-config.factory';
import { buildRichTextConfig } from './util/call-richtext-config.factory';
import { CallService } from '../../services/call-service';


@Component({
  selector: 'app-call',
  standalone: true,
  templateUrl: './call.html',
  styleUrl: './call.css',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    SelectDynamicComponent,
    InputDynamicComponent,
    RichTextDynamicComponent,
    ButtonDynamic,
    TagsNeuComponent,
  ]
})
export class Call implements OnInit, OnDestroy {

   // Ícones SVG
   readonly addIcon = `
   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
     <path d="M12 5v14M5 12h14"/>
   </svg>
 `;
  
  callForm!: FormGroup;
  companies: Company[] = [];
  clients: User[] = [];
  isLoadingClients = false;
  isConfigsReady = false;

  inputConfigs: any = {};
  selectConfigs: any = {};
  richTextConfig: any;
  

  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);
  private auth = inject(AuthService);
  private companyLoader = inject(CallCompanyLoaderService);
  private clientLoader = inject(CallClientLoaderService);
  private formBuilder = inject(CallFormBuilderService);
  private callService = inject(CallService);

  private langSub!: Subscription;
  private loggedUser!: User;
  

  async ngOnInit() {
    this.loggedUser = this.auth.currentUser()!;
    this.callForm = this.formBuilder.createForm(this.loggedUser);

    this.setupCompanyChange();
    await this.loadCompanies();

    this.initializeConfigs();
    this.langSub = this.translate.onLangChange.subscribe(() => this.initializeConfigs());
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
  }

  private async loadCompanies() {
    this.companies = await this.companyLoader.loadCompanies();
  }

  private setupCompanyChange() {
    this.empresaControl.valueChanges.subscribe(async (empresaId) => {
      const empresa = this.companies.find(c => c.id === empresaId);
      if (!empresa) {
        this.clients = [];
        this.updateConfigs();
        return;
      }
      this.isLoadingClients = true;
      this.clients = await this.clientLoader.loadClientsByCompany(empresa);
      this.isLoadingClients = false;
      this.updateConfigs();
      this.cdr.detectChanges();
    });
  }

  private initializeConfigs() {
    this.inputConfigs = buildInputConfigs(this.translate);
    this.selectConfigs = buildSelectConfigs(this.translate, this.companies, this.clients, this.isLoadingClients);
    this.richTextConfig = buildRichTextConfig(this.translate);
    this.isConfigsReady = true;
  }

  private updateConfigs() {
    this.selectConfigs = buildSelectConfigs(this.translate, this.companies, this.clients, this.isLoadingClients);
  }

  get empresaControl(): FormControl {
    return this.callForm.get('companyId') as FormControl;
  }
  get clienteControl(): FormControl {
    return this.callForm.get('clientId') as FormControl;
  }
  get conexaoControl(): FormControl {
    return this.callForm.get('connection') as FormControl;
  }
  get tituloControl(): FormControl {
    return this.callForm.get('title') as FormControl;
  }
  get descricaoControl(): FormControl {
    return this.callForm.get('description') as FormControl;
  }
  get conteudoControl(): FormControl {
    return this.callForm.get('resolution') as FormControl;
  }
  get tagsControl(): FormControl {
    return this.callForm.get('tags') as FormControl;
  }

  async onSubmit() {
    if (this.callForm.valid) {
      console.log('📤 Dados do chamado:', this.callForm.value);
      await this.callService.saveCall(this.callForm.value);
    } else {
      this.callForm.markAllAsTouched();
    }
  }

  onAddEmpresa() {
    console.log('add company');
  }

  onAddCliente() {
    console.log('add client');
  }
}
