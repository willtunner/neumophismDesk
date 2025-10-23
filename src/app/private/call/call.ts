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

import { Client, Company, User } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { CallCompanyLoaderService } from './util/call-company-loader.service';
import { CallClientLoaderService } from './util/call-client-loader.service';
import { CallFormBuilderService } from './util/call-form-builder.service';
import { buildInputConfigs } from './util/call-input-config.factory';
import { buildSelectConfigs } from './util/call-select-config.factory';
import { buildRichTextConfig } from './util/call-richtext-config.factory';
import { CallService } from '../../services/call-service';
import { MatDialog } from '@angular/material/dialog';
import { CompanyModalComponent } from '../companies/create-company-modal/create-company-modal';
import { ClientModalComponent } from '../clients/create-client-modal/create-client-modal';
import { NotificationService } from '../../services/notification';
import { NotificationTitle, NotificationType } from '../../enuns/notification-icon-types.enum';
import { CallList } from './call-list/call-list';
import { Call } from '../../models/models';
import { ActivatedRoute, Router } from '@angular/router';


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
    CallList
  ]
})
export class CallComponent implements OnInit, OnDestroy {

  // Ícones SVG
  readonly addIcon = `
   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
     <path d="M12 5v14M5 12h14"/>
   </svg>
 `;

  callForm!: FormGroup;
  callsList: Call[] = [];
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
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private langSub!: Subscription;
  private loggedUser!: User;


  async ngOnInit() {
    this.loggedUser = this.auth.currentUser()!;
    this.callForm = this.formBuilder.createForm(this.loggedUser);
    this.callsList = await this.callService.getAllCalls();
    console.log('Chamado: ', this.callsList);

    this.setupCompanyChange();
    await this.loadCompanies();

    this.initializeConfigs();

    // 🆕 Verifica se há ID na URL
    this.route.paramMap.subscribe(async (params) => {
      const callId = params.get('id');
      if (callId) {
        const call = await this.callService.getCallById(callId);
        if (call) {
          this.callForm.patchValue(call);
        }
      }
    });

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
      const call = await this.callService.saveCall(this.callForm.value);
      this.notificationService.createNotification(
        NotificationTitle.CREATE_CLIENT,
        NotificationType.SUCCESS,
        `${call.title} Cradastrado com sucesso!`,
        false
      );
    } else {
      this.callForm.markAllAsTouched();
    }
  }

  onAddEmpresa() {
    const dialogRef = this.dialog.open(CompanyModalComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe((result: Company) => {
      if (result) {
        console.log('✅ Nova empresa cadastrada:', result);
        this.notificationService.createNotification(
          NotificationTitle.CREATE_COMPANY,
          NotificationType.SUCCESS,
          `${result.name} Criada com sucesso!`,
          false
        );
        // Aqui você pode salvar no Firestore, atualizar a lista etc.
      }
    });
  }

  onAddCliente() {
    const dialogRef = this.dialog.open(ClientModalComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe((result: Client) => {
      if (result) {
        console.log('✅ Novo cliente cadastrado:', result);
        this.notificationService.createNotification(
          NotificationTitle.CREATE_CLIENT,
          NotificationType.SUCCESS,
          `${result.username} Cradastrado com sucesso!`,
          false
        );
      }
    });
  }

   // 🆕 Quando clicar em uma linha na tabela
  onViewDetails(call: Call) {
    this.router.navigate(['/call', call.id]);
    this.callForm.patchValue(call);
  }

}
