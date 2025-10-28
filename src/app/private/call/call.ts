import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, signal } from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { CompanyModalComponent } from '../companies/create-company-modal/create-company-modal';
import { ClientModalComponent } from '../clients/create-client-modal/create-client-modal';
import { NotificationService } from '../../services/notification';
import { NotificationTitle, NotificationType } from '../../enuns/notification-icon-types.enum';
import { CallList } from './call-list/call-list';
import { Call } from '../../models/models';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from '../../services/company';
import { ClientService } from '../../services/client';

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

  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);
  private auth = inject(AuthService);
  private companyLoader = inject(CallCompanyLoaderService);
  private clientLoader = inject(CallClientLoaderService);
  private formBuilder = inject(CallFormBuilderService);
  private callService = inject(CallService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private companyService = inject(CompanyService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientService = inject(ClientService);

  private langSub!: Subscription;
  private loggedUser!: User;

  // Ícones SVG
  readonly addIcon = `
   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
     <path d="M12 5v14M5 12h14"/>
   </svg>
 `;

  callForm!: FormGroup;
  callsList: Call[] = [];
  companies = this.companyService.companies;
  clients = signal<User[]>([]);
  isLoadingClients = false;
  isConfigsReady = false;

  // 🔹 NOVO: Signal para chamado selecionado
  selectedCall = signal<Call | null>(null);

  inputConfigs: any = {};
  selectConfigs: any = {};
  richTextConfig: any;

  async ngOnInit() {
    this.loggedUser = this.auth.currentUser()!;
    this.callForm = this.formBuilder.createForm(this.loggedUser);
    
    // 🔹 ORDEM CORRETA: Primeiro configura os listeners, depois carrega os dados
    this.setupRouteListener();
    
    await this.loadCalls();

    console.log('📞 Chamados carregados:', this.callsList.length);

    // Configura mudança de empresa
    this.setupCompanyChange();

    // Carrega empresas iniciais
    await this.loadCompanies();

    // Inicializa configurações
    this.initializeConfigs();

    // Atualiza configurações quando idioma mudar
    this.langSub = this.translate.onLangChange.subscribe(() => this.initializeConfigs());
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
  }

  // 🔹 NOVO: Configura listener de rota
  private setupRouteListener() {
    this.route.paramMap.subscribe(async (params) => {
      const callId = params.get('id');
      console.log('🔄 Route param changed:', callId);
      
      if (callId) {
        await this.selectCallById(callId);
      } else {
        this.clearFormAndSelection();
      }
    });
  }

  // 🔹 NOVO: Carrega chamados e verifica seleção inicial
  private async loadCalls() {
    this.callsList = await this.callService.getAllCalls();
    
    // 🔹 VERIFICA SE HÁ ID NA URL APÓS CARREGAR OS DADOS
    const initialCallId = this.route.snapshot.paramMap.get('id');
    if (initialCallId) {
      await this.selectCallById(initialCallId);
    }
  }

  // 🔹 NOVO: Seleciona chamado por ID
  private async selectCallById(callId: string) {
    try {
      console.log('🔍 Procurando chamado com ID:', callId);
      
      // Primeiro procura nos dados locais
      let call = this.callsList.find(c => c.id === callId) || null;
      
      // Se não encontrou, tenta carregar pelo service
      if (!call) {
        console.log('⚠️ Chamado não encontrado nos dados locais, buscando no service...');
        call = await this.callService.getCallById(callId);
      }
      
      if (call) {
        console.log('✅ Chamado encontrado:', call.title);
        this.setSelectedCall(call);
      } else {
        console.warn('❌ Chamado não encontrado com ID:', callId);
        this.clearSelection();
      }
    } catch (error) {
      console.error('❌ Erro ao selecionar chamado:', error);
      this.clearSelection();
    }
  }

  // 🔹 NOVO: Define chamado selecionado
  private setSelectedCall(call: Call) {
    this.selectedCall.set(call);
    this.populateForm(call);
    console.log('🎯 Chamado selecionado:', call.title);
    this.cdr.detectChanges();
  }

  // 🔹 NOVO: Limpa seleção
  private clearSelection() {
    this.selectedCall.set(null);
    this.cdr.detectChanges();
  }

  // 🔹 NOVO: Limpa formulário e seleção
  private clearFormAndSelection() {
    this.callForm.reset();
    this.clearSelection();
  }

  // 🔹 NOVO: Popula formulário com dados do chamado
  private populateForm(call: Call) {
    this.callForm.patchValue({
      companyId: call.companyId,
      clientId: call.clientId,
      connection: call.connection,
      title: call.title,
      description: call.description,
      resolution: call.resolution,
      tags: call.tags || []
    });
  }

  private async loadCompanies() {
    try {
      await this.companyService.loadAllCompanies();
      console.log('🏢 Empresas carregadas do service:', this.companies().length);
    } catch (error) {
      console.error('❌ Erro ao carregar empresas:', error);
    }
  }

  private setupCompanyChange() {
    this.empresaControl.valueChanges.subscribe(async (empresaId) => {
      console.log('🏢 Empresa selecionada:', empresaId);

      // Limpa clientes anteriores e reseta o select de cliente
      this.clients.set([]);
      this.clienteControl.reset();

      if (!empresaId) {
        console.log('❌ Nenhuma empresa selecionada');
        this.updateConfigs();
        return;
      }

      const empresa = this.companies().find(c => c.id === empresaId);
      if (!empresa) {
        console.log('❌ Empresa não encontrada');
        this.updateConfigs();
        return;
      }

      // Busca clientes da empresa selecionada
      await this.loadClientsByCompany(empresaId);
    });
  }

  private async loadClientsByCompany(companyId: string) {
    this.isLoadingClients = true;
    console.log('🔄 Buscando clientes da empresa...');

    try {
      const clientesDaEmpresa = await this.clientService.loadClientsByCompany(companyId);
      console.log('✅ Clientes encontrados:', clientesDaEmpresa.length);

      // Atualiza signal com os clientes encontrados
      this.clients.set(clientesDaEmpresa);

    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error);
      this.clients.set([]);
    } finally {
      this.isLoadingClients = false;
      this.updateConfigs();
      this.cdr.detectChanges();
    }
  }

  private initializeConfigs() {
    this.inputConfigs = buildInputConfigs(this.translate);
    this.selectConfigs = buildSelectConfigs(
      this.translate,
      this.companies(),
      this.clients(),
      this.isLoadingClients
    );
    this.richTextConfig = buildRichTextConfig(this.translate);
    this.isConfigsReady = true;
  }

  private updateConfigs() {
    console.log('🔄 Atualizando configurações...');
    console.log('🏢 Empresas:', this.companies().length);
    console.log('👥 Clientes:', this.clients().length);
    console.log('⏳ Carregando:', this.isLoadingClients);

    this.selectConfigs = buildSelectConfigs(
      this.translate,
      this.companies(),
      this.clients(),
      this.isLoadingClients
    );
    this.cdr.detectChanges();
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
      try {
        console.log('📤 Dados do chamado:', this.callForm.value);
        const call = await this.callService.saveCall(this.callForm.value);

        const path = `call/${call.id}`;

        this.notificationService.createNotification(
          NotificationTitle.CREATE_CALL,
          NotificationType.SUCCESS,
          `${call.title} criado com sucesso!`,
          false,
          path,
        );

        // 🔹 ATUALIZADO: Recarrega lista e seleciona novo chamado
        await this.loadCalls();
        this.setSelectedCall(call);
        this.router.navigate(['/call', call.id]);

      } catch (error) {
        console.error('❌ Erro ao salvar chamado:', error);
      }
    } else {
      this.callForm.markAllAsTouched();
    }
  }

  onAddEmpresa() {
    const dialogRef = this.dialog.open(CompanyModalComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe((company: Company) => {
      if (company) {
        this.companyService.saveCompany(company).then((savedCompany) => {
          console.log('✅ Nova empresa cadastrada:', savedCompany.name);
          
          // Atualiza configurações e seleciona a nova empresa
          this.updateConfigs();
          this.empresaControl.setValue(savedCompany.id);
          
        }).catch(error => {
          console.error('❌ Erro ao salvar empresa:', error);
        });
      }
    });
  }

  onAddCliente() {
    const selectedCompanyId = this.empresaControl.value;

    if (!selectedCompanyId) {
      //! CRIAR ALERTA DE ('Selecione uma empresa antes de adicionar um cliente')
      return;
    }

    const selectedCompany = this.companies().find(company => company.id === selectedCompanyId);

    if (!selectedCompany) {
      //! CRIAR ALERTA DE ('Empresa selecionada não encontrada')
      return;
    }

    const dialogRef = this.dialog.open(ClientModalComponent, {
      width: '600px',
      data: { selectedCompany }
    });

    dialogRef.afterClosed().subscribe((clientData: Omit<User, 'id' | 'created' | 'updated'>) => {
      if (clientData) {
        console.log('💾 Salvando novo cliente...');
        
        this.clientService.saveClient(clientData, selectedCompany).then((savedClient) => {
          console.log('✅ Novo cliente cadastrado:', savedClient.name, ' do posto ', selectedCompany.name, '.');
          
          // Se o cliente pertence à empresa selecionada, adiciona ao signal
          if (savedClient.companyId === selectedCompanyId) {
            this.clients.update(clientes => [savedClient, ...clientes]);
            
            // Atualiza configurações e seleciona o novo cliente
            this.updateConfigs();
            this.clienteControl.setValue(savedClient.id);
            
            console.log('👥 Clientes atualizados:', this.clients().length);
          }
          
        }).catch(error => {
          console.error('❌ Erro ao salvar cliente:', error);
        });
      }
    });
  }

  // 🆕 Quando clicar em uma linha na tabela
  onViewDetails(call: Call) {
    this.setSelectedCall(call);
    this.router.navigate(['/call', call.id]);
  }

  // 🔹 NOVO: Getter para o CallList
  getSelectedCall(): Call | null {
    return this.selectedCall();
  }
}