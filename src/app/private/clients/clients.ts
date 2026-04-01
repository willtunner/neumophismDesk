// clients.ts - COMPONENTE ATUALIZADO COM DROPDOWN AUTOMÁTICO
import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { SelectDynamicComponent } from '../../shared/components/select-dynamic/select-dynamic';
import { InputDynamicComponent } from '../../shared/components/input-dynamic/input-dynamic';
import { DynamicTableComponent } from '../../shared/components/dynamic-table/dynamic-table';

import { User } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification';
import { NotificationTitle, NotificationType } from '../../enuns/notification-icon-types.enum';
import { ClientService } from '../../services/client';
import { CompanyService } from '../../services/company';

interface CompanyGroup {
  companyId: string;
  companyName: string;
  clients: User[];
}

@Component({
  selector: 'app-clients',
  standalone: true,
  templateUrl: './clients.html',
  styleUrl: './clients.css',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    SelectDynamicComponent,
    InputDynamicComponent,
    DynamicTableComponent
  ]
})
export class Clients implements OnInit, OnDestroy {

  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);
  private auth = inject(AuthService);
  private clientService = inject(ClientService);
  private companyService = inject(CompanyService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  private langSub!: Subscription;
  private loggedUser!: User;

  // 🔹 HEADERS PARA A DYNAMIC TABLE
  tableHeaders = [
    { label: 'CLIENTS.FIELDS.USERNAME', field: 'username' },
    { label: 'CLIENTS.FIELDS.NAME', field: 'name' },
    { label: 'CLIENTS.FIELDS.EMAIL', field: 'email' },
    { label: 'CLIENTS.FIELDS.PHONE', field: 'phone' },
    { label: 'CLIENTS.FIELDS.CONNECTION', field: 'connection' },
    { label: 'CLIENTS.FIELDS.COMPANY', field: 'companyName' },
    { label: 'CLIENTS.FIELDS.CREATED', field: 'created' }
  ];

  // 🔹 SIGNAL PARA LINHA SELECIONADA
  selectedClient = signal<User | null>(null);

  // Forms
  filterForm!: FormGroup;
  clientForm!: FormGroup;

  // Signals
  clients = this.clientService.clients;
  companies = this.companyService.companies;
  
  // Estados
  isLoading = false;
  isConfigsReady = false;
  isEditing = false;
  currentClientId = signal<string | null>(null);

  // Dropdown states
  openedDropdown: string | null = null;
  hoveredCompany: string | null = null;

  // Configurações
  inputConfigs: any = {};
  selectConfigs: any = {};

  // Controles para datas
  startDateControl = new FormControl('');
  endDateControl = new FormControl('');

  // 🔹 COMPUTED: Agrupa clientes por empresa
  clientsByCompany = computed((): CompanyGroup[] => {
    const clients = this.clients();
    const companies = this.companies();
    
    const companyMap = new Map<string, CompanyGroup>();
    
    // Inicializa o mapa com todas as empresas
    companies.forEach(company => {
      companyMap.set(company.id, {
        companyId: company.id,
        companyName: company.name,
        clients: []
      });
    });
    
    // Agrupa clientes por empresa
    clients.forEach(client => {
      const companyGroup = companyMap.get(client.companyId!);
      if (companyGroup) {
        companyGroup.clients.push(client);
      } else {
        // Se a empresa não foi encontrada, cria um grupo para "Empresa Desconhecida"
        const unknownCompany = companyMap.get('unknown') || {
          companyId: 'unknown',
          companyName: 'Empresa Desconhecida',
          clients: []
        };
        unknownCompany.clients.push(client);
        companyMap.set('unknown', unknownCompany);
      }
    });
    
    // Filtra apenas empresas que têm clientes
    return Array.from(companyMap.values())
      .filter(group => group.clients.length > 0)
      .sort((a, b) => b.clients.length - a.clients.length);
  });

  // 🔹 COMPUTED: Clientes filtrados (para busca)
  filteredClients = computed(() => {
    const filters = this.filterForm?.value || {};
    const startDate = this.startDateControl.value;
    const endDate = this.endDateControl.value;
    
    let filtered = this.clients();

    // Filtro por texto
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(client => {
        switch (filters.filterField) {
          case 'username':
            return client.username?.toLowerCase().includes(searchTerm) || false;
          case 'name':
            return client.name.toLowerCase().includes(searchTerm);
          case 'email':
            return client.email.toLowerCase().includes(searchTerm);
          case 'phone':
            return client.phone?.toLowerCase().includes(searchTerm) || false;
          case 'connection':
            return client.connection?.toLowerCase().includes(searchTerm) || false;
          default:
            return true;
        }
      });
    }

    // Filtro por data
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(client => new Date(client.created) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter(client => new Date(client.created) <= end);
    }

    return filtered;
  });

  async ngOnInit() {
    this.loggedUser = this.auth.currentUser()!;
    this.initForms();
    
    // 🔹 ORDEM CORRETA: Primeiro configura os listeners, depois carrega os dados
    this.setupRouteListener();
    this.initializeConfigs();
    
    await this.loadData();

    this.langSub = this.translate.onLangChange.subscribe(() => this.initializeConfigs());
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
  }

  private initForms() {
    // Formulário de filtro
    this.filterForm = this.fb.group({
      search: [''],
      filterField: ['name']
    });

    // Formulário do cliente
    this.clientForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      connection: [''],
      companyId: ['', [Validators.required]],
      roles: [[]],
      imageUrl: ['']
    });

    // Listener para filtros
    this.filterForm.valueChanges.subscribe(() => {
      this.cdr.detectChanges();
      // 🔹 VERIFICA SE O CLIENTE SELECIONADO AINDA ESTÁ NOS DADOS FILTRADOS
      this.checkSelectedClientInFilteredData();
    });
    
    // Listener para datas
    this.startDateControl.valueChanges.subscribe(() => {
      this.cdr.detectChanges();
      this.checkSelectedClientInFilteredData();
    });
    
    this.endDateControl.valueChanges.subscribe(() => {
      this.cdr.detectChanges();
      this.checkSelectedClientInFilteredData();
    });
  }

  private setupRouteListener() {
    this.route.paramMap.subscribe(async (params) => {
      const clientId = params.get('id');
      console.log('🔄 Route param changed:', clientId);
      
      if (clientId) {
        await this.selectClientById(clientId);
      } else {
        this.clearFormAndSelection();
        // 🔹 FECHA TODOS OS DROPDOWNS QUANDO NÃO HÁ ID
        this.openedDropdown = null;
      }
    });
  }

  private async loadData() {
    try {
      this.isLoading = true;
      await Promise.all([
        this.clientService.loadAllClients(),
        this.companyService.loadAllCompanies()
      ]);
      
      // 🔹 VERIFICA SE HÁ ID NA URL APÓS CARREGAR OS DADOS
      const initialClientId = this.route.snapshot.paramMap.get('id');
      if (initialClientId) {
        await this.selectClientById(initialClientId);
      }
      
      this.cdr.detectChanges();
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async selectClientById(clientId: string) {
  try {
    console.log('🔍 Procurando cliente com ID:', clientId);
    
    // 🔹 PRIMEIRO: Encontra o cliente nos dados atuais (incluindo filtros)
    let client = this.findClientInData(clientId);
    
    // 🔹 SEGUNDO: Se não encontrou, tenta carregar pelo service
    if (!client) {
      console.log('⚠️ Cliente não encontrado nos dados locais, buscando no service...');
      client = await this.clientService.getClientById(clientId);
      
      // 🔹 CORREÇÃO: Se carregou do service, encontra o mesmo objeto nos dados locais
      if (client) {
        const localClient = this.findClientInData(clientId);
        if (localClient) {
          client = localClient; // Usa o objeto local para garantir referência igual
        }
      }
    }
    
    if (client) {
      console.log('✅ Cliente encontrado:', client.name);
      this.setSelectedClient(client);
      
      // 🔹 ABRE O DROPDOWN DA EMPRESA DO CLIENTE
      this.openCompanyDropdown(client.companyId);
    } else {
      console.warn('❌ Cliente não encontrado com ID:', clientId);
      this.clearSelection();
      this.openedDropdown = null;
    }
  } catch (error) {
    console.error('❌ Erro ao selecionar cliente:', error);
    this.clearSelection();
    this.openedDropdown = null;
  }
}

  // 🔹 NOVO: Método para abrir o dropdown da empresa automaticamente
  private openCompanyDropdown(companyId: string | undefined) {
    if (companyId) {
      console.log('🏢 Abrindo dropdown da empresa:', companyId);
      this.openedDropdown = companyId;
      this.cdr.detectChanges();
    }
  }

  private findClientInData(clientId: string): User | null {
    // 🔹 PROCURA PRIMEIRO NOS DADOS FILTRADOS
    let client = this.filteredClients().find(c => c.id === clientId) || null;
    
    // 🔹 SE NÃO ENCONTRAR, PROCURA EM TODOS OS DADOS
    if (!client) {
      client = this.clients().find(c => c.id === clientId) || null;
    }
    
    return client;
  }

  private setSelectedClient(client: User) {
    this.selectedClient.set(client);
    this.populateForm(client);
    this.currentClientId.set(client.id);
    this.isEditing = true;
    
    console.log('🎯 Cliente selecionado na tabela:', client.name);
    
    // 🔹 FORÇA A ATUALIZAÇÃO DA UI
    this.cdr.detectChanges();
  }

  private clearSelection() {
    this.selectedClient.set(null);
    this.currentClientId.set(null);
    this.isEditing = false;
    this.cdr.detectChanges();
  }

  private clearFormAndSelection() {
    this.clientForm.reset();
    this.clearSelection();
    this.roles.set([]);
  }

  private checkSelectedClientInFilteredData() {
    const selected = this.selectedClient();
    if (selected && !this.filteredClients().some(c => c.id === selected.id)) {
      console.log('⚠️ Cliente selecionado não está mais nos dados filtrados');
      this.clearSelection();
      // 🔹 FECHA O DROPDOWN SE O CLIENTE NÃO ESTÁ MAIS VISÍVEL
      this.openedDropdown = null;
    }
  }

  private populateForm(client: User) {
    this.clientForm.patchValue({
      username: client.username,
      name: client.name,
      email: client.email,
      phone: client.phone,
      password: client.password,
      connection: client.connection,
      companyId: client.companyId,
      roles: client.roles || [],
      imageUrl: client.imageUrl || ''
    });
    
    // Atualiza as roles no signal
    this.roles.set(client.roles || []);
  }

  private initializeConfigs() {
    this.inputConfigs = this.buildInputConfigs();
    this.selectConfigs = this.buildSelectConfigs();
    this.isConfigsReady = true;
    this.cdr.detectChanges();
  }

  private buildInputConfigs() {
    return {
      search: {
        label: this.translate.instant('CLIENTS.FILTERS.SEARCH'),
        placeholder: this.translate.instant('CLIENTS.FILTERS.SEARCH_PLACEHOLDER'),
        type: 'text',
        icon: 'search'
      },
      name: {
        label: this.translate.instant('CLIENTS.FIELDS.NAME'),
        placeholder: this.translate.instant('CLIENTS.FIELDS.PLACEHOLDER_NAME'),
        type: 'text',
        icon: 'person',
        required: true,
        customErrorMessages: {
          required: this.translate.instant('VALIDATOR_ERROR_MESSAGES.REQUIRED'),
          minlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MINLENGTH', { requiredLength: 2 })
        }
      },
      username: {
        label: this.translate.instant('CLIENTS.FIELDS.USERNAME'),
        placeholder: this.translate.instant('CLIENTS.FIELDS.PLACEHOLDER_USERNAME'),
        type: 'text',
        icon: 'badge',
        required: true,
        customErrorMessages: {
          required: this.translate.instant('VALIDATOR_ERROR_MESSAGES.REQUIRED'),
          minlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MINLENGTH', { requiredLength: 3 })
        }
      },
      email: {
        label: this.translate.instant('CLIENTS.FIELDS.EMAIL'),
        placeholder: this.translate.instant('CLIENTS.FIELDS.PLACEHOLDER_EMAIL'),
        type: 'email',
        icon: 'email',
        required: true,
        customErrorMessages: {
          required: this.translate.instant('VALIDATOR_ERROR_MESSAGES.REQUIRED'),
          email: this.translate.instant('VALIDATOR_ERROR_MESSAGES.EMAIL')
        }
      },
      phone: {
        label: this.translate.instant('CLIENTS.FIELDS.PHONE'),
        placeholder: this.translate.instant('CLIENTS.FIELDS.PLACEHOLDER_PHONE'),
        type: 'tel',
        icon: 'phone',
        required: true,
        customErrorMessages: {
          required: this.translate.instant('VALIDATOR_ERROR_MESSAGES.REQUIRED')
        }
      },
      password: {
        label: this.translate.instant('CLIENTS.FIELDS.PASSWORD'),
        placeholder: this.translate.instant('CLIENTS.FIELDS.PLACEHOLDER_PASSWORD'),
        type: 'password',
        icon: 'lock',
        required: true,
        customErrorMessages: {
          required: this.translate.instant('VALIDATOR_ERROR_MESSAGES.REQUIRED'),
          minlength: this.translate.instant('VALIDATOR_ERROR_MESSAGES.MINLENGTH', { requiredLength: 6 })
        }
      },
      connection: {
        label: this.translate.instant('CLIENTS.FIELDS.CONECTION'),
        placeholder: this.translate.instant('CLIENTS.FIELDS.PLACEHOLDER_CONECTION'),
        type: 'text',
        icon: 'link'
      }
    };
  }

  private buildSelectConfigs() {
    const companyOptions = this.companies().map(company => ({
      value: company.id,
      label: company.name
    }));

    return {
      filterField: {
        label: this.translate.instant('CLIENTS.FILTERS.FILTER_BY'),
        options: [
          { value: 'name', label: this.translate.instant('CLIENTS.FIELDS.NAME') },
          { value: 'username', label: this.translate.instant('CLIENTS.FIELDS.USERNAME') },
          { value: 'email', label: this.translate.instant('CLIENTS.FIELDS.EMAIL') },
          { value: 'phone', label: this.translate.instant('CLIENTS.FIELDS.PHONE') },
          { value: 'connection', label: this.translate.instant('CLIENTS.FIELDS.CONNECTION') }
        ],
        icon: 'filter_list'
      },
      company: {
        label: this.translate.instant('CLIENTS.FIELDS.COMPANY'),
        options: companyOptions,
        placeholder: this.translate.instant('CLIENTS.FIELDS.PLACEHOLDER_COMPANY'),
        icon: 'business',
        required: true,
        customErrorMessages: {
          required: this.translate.instant('VALIDATOR_ERROR_MESSAGES.REQUIRED')
        }
      }
    };
  }

  // 🔹 MÉTODOS PARA ROLES
  roles = signal<string[]>([]);

  onRolesChange(roles: string[]) {
    this.roles.set(roles);
    this.clientForm.patchValue({ roles });
  }

  // 🔹 MÉTODOS PARA DROPDOWN
  toggleDropdown(companyId: string): void {
    this.openedDropdown = this.openedDropdown === companyId ? null : companyId;
  }

  // 🔹 MÉTODOS PARA A DYNAMIC TABLE
  onTableRowClick(client: User) {
    console.log('🖱️ Clicou na linha:', client.name);
    this.setSelectedClient(client);
    this.router.navigate(['/clients', client.id]);
    
    // 🔹 GARANTE QUE O DROPDOWN DA EMPRESA ESTEJA ABERTO
    this.openCompanyDropdown(client.companyId);
  }

  onSelectedRowChange(client: User | null) {
    this.selectedClient.set(client);
  }

  // Getters para os controles
  get searchControl(): FormControl {
    return this.filterForm.get('search') as FormControl;
  }

  get filterFieldControl(): FormControl {
    return this.filterForm.get('filterField') as FormControl;
  }

  get usernameControl(): FormControl {
    return this.clientForm.get('username') as FormControl;
  }

  get nameControl(): FormControl {
    return this.clientForm.get('name') as FormControl;
  }

  get emailControl(): FormControl {
    return this.clientForm.get('email') as FormControl;
  }

  get phoneControl(): FormControl {
    return this.clientForm.get('phone') as FormControl;
  }

  get passwordControl(): FormControl {
    return this.clientForm.get('password') as FormControl;
  }

  get connectionControl(): FormControl {
    return this.clientForm.get('connection') as FormControl;
  }

  get companyControl(): FormControl {
    return this.clientForm.get('companyId') as FormControl;
  }

  async onSubmit() {
    if (this.clientForm.valid) {
      try {
        const clientData = this.clientForm.value;
        const selectedCompany = this.companies().find(company => company.id === clientData.companyId);

        if (this.isEditing && this.currentClientId()) {
          // Atualizar cliente existente
          await this.clientService.updateClient(this.currentClientId()!, clientData);
          this.notificationService.createNotification(
            NotificationTitle.UPDATE_CLIENT,
            NotificationType.SUCCESS,
            'Cliente atualizado com sucesso!',
            false,
            `/clients/${this.currentClientId()}`
          );
          
          // 🔹 ATUALIZA A SELEÇÃO APÓS EDIÇÃO
          const updatedClient = await this.clientService.getClientById(this.currentClientId()!);
          if (updatedClient) {
            this.setSelectedClient(updatedClient);
            // 🔹 MANTÉM O DROPDOWN ABERTO
            this.openCompanyDropdown(updatedClient.companyId);
          }
        } else {
          // Criar novo cliente
          const newClient = await this.clientService.saveClient(clientData, selectedCompany);
          this.notificationService.createNotification(
            NotificationTitle.CREATE_CLIENT,
            NotificationType.SUCCESS,
            'Cliente criado com sucesso!',
            false,
            `/clients/${newClient.id}`
          );
          
          // 🔹 SELECIONA O NOVO CLIENTE
          this.setSelectedClient(newClient);
          this.router.navigate(['/clients', newClient.id]);
          // 🔹 ABRE O DROPDOWN DA EMPRESA DO NOVO CLIENTE
          this.openCompanyDropdown(newClient.companyId);
        }

        // Recarrega os dados para atualizar a lista
        await this.loadData();

      } catch (error) {
        console.error('❌ Erro ao salvar cliente:', error);
      }
    } else {
      this.clientForm.markAllAsTouched();
    }
  }

  onEditClient(client: User) {
    this.router.navigate(['/clients', client.id]);
  }

  async onDeleteClient(client: User) {
    if (confirm(`Tem certeza que deseja excluir o cliente ${client.name}?`)) {
      try {
        const success = await this.clientService.deleteClient(client.id);
        if (success) {
          this.notificationService.createNotification(
            NotificationTitle.DELETED_CLIENT,
            NotificationType.SUCCESS,
            'Cliente excluído com sucesso!',
            false,
            null
          );
          
          // Recarrega a lista
          await this.loadData();
          
          // Limpa seleção se o cliente excluído era o selecionado
          if (this.selectedClient()?.id === client.id) {
            this.clearFormAndSelection();
            this.router.navigate(['/clients']);
            // 🔹 FECHA O DROPDOWN
            this.openedDropdown = null;
          }
        }
      } catch (error) {
        console.error('❌ Erro ao excluir cliente:', error);
      }
    }
  }

  onClearFilters() {
    this.filterForm.reset({
      search: '',
      filterField: 'name'
    });
    this.startDateControl.reset('');
    this.endDateControl.reset('');
  }

  onNewClient() {
    this.router.navigate(['/clients']);
    this.clearFormAndSelection();
    // 🔹 FECHA TODOS OS DROPDOWNS
    this.openedDropdown = null;
  }

  private updateConfigs() {
    // Atualiza as opções de empresas
    this.selectConfigs = this.buildSelectConfigs();
    this.cdr.detectChanges();
  }
}