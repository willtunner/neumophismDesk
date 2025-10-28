// clients.ts - COMPONENTE ATUALIZADO
import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { SelectDynamicComponent } from '../../shared/components/select-dynamic/select-dynamic';
import { InputDynamicComponent } from '../../shared/components/input-dynamic/input-dynamic';
import { ButtonDynamic } from '../../shared/components/button-dynamic/button-dynamic';
import { TagsNeuComponent } from '../../shared/components/tags-neu/tags-neu';
import { DynamicTableComponent } from '../../shared/components/dynamic-table/dynamic-table';

import { Client, Company, User } from '../../models/models';
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
    ButtonDynamic,
    TagsNeuComponent,
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
    await this.loadData();

    this.setupRouteListener();
    this.initializeConfigs();

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
    this.filterForm.valueChanges.subscribe(() => this.cdr.detectChanges());
    
    // Listener para datas
    this.startDateControl.valueChanges.subscribe(() => this.cdr.detectChanges());
    this.endDateControl.valueChanges.subscribe(() => this.cdr.detectChanges());
  }

  private setupRouteListener() {
    this.route.paramMap.subscribe(async (params) => {
      const clientId = params.get('id');
      if (clientId) {
        await this.loadClientById(clientId);
      } else {
        this.clearForm();
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
      this.cdr.detectChanges();
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      //! NOTIFICAÇÃO: Erro ao carregar dados:
    } finally {
      this.isLoading = false;
    }
  }

  private async loadClientById(clientId: string) {
    try {
      const client = await this.clientService.getClientById(clientId);
      if (client) {
        this.populateForm(client);
        this.currentClientId.set(clientId);
        this.isEditing = true;
        this.selectedClient.set(client);
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('❌ Erro ao carregar cliente:', error);
     //! NOTIFICAÇÃO: Erro ao carregar cliente:
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

  private clearForm() {
    this.clientForm.reset();
    this.currentClientId.set(null);
    this.isEditing = false;
    this.selectedClient.set(null);
    this.roles.set([]);
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
        label: 'CLIENTS.FILTERS.SEARCH',
        placeholder: 'CLIENTS.PLACEHOLDERS.SEARCH',
        type: 'text',
        icon: 'search'
      },
      name: {
        label: 'CLIENTS.FIELDS.NAME',
        placeholder: 'CLIENTS.PLACEHOLDERS.NAME',
        type: 'text',
        icon: 'person',
        required: true
      },
      username: {
        label: 'CLIENTS.FIELDS.USERNAME',
        placeholder: 'CLIENTS.PLACEHOLDERS.USERNAME',
        type: 'text',
        icon: 'badge',
        required: true
      },
      email: {
        label: 'CLIENTS.FIELDS.EMAIL',
        placeholder: 'CLIENTS.PLACEHOLDERS.EMAIL',
        type: 'email',
        icon: 'email',
        required: true
      },
      phone: {
        label: 'CLIENTS.FIELDS.PHONE',
        placeholder: 'CLIENTS.PLACEHOLDERS.PHONE',
        type: 'tel',
        icon: 'phone',
        required: true
      },
      password: {
        label: 'CLIENTS.FIELDS.PASSWORD',
        placeholder: 'CLIENTS.PLACEHOLDERS.PASSWORD',
        type: 'password',
        icon: 'lock',
        required: true
      },
      connection: {
        label: 'CLIENTS.FIELDS.CONNECTION',
        placeholder: 'CLIENTS.PLACEHOLDERS.CONNECTION',
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
        label: 'CLIENTS.FIELDS.FILTER_BY',
        options: [
          { value: 'name', label: 'CLIENTS.FIELDS.NAME' },
          { value: 'username', label: 'CLIENTS.FIELDS.USERNAME' },
          { value: 'email', label: 'CLIENTS.FIELDS.EMAIL' },
          { value: 'phone', label: 'CLIENTS.FIELDS.PHONE' },
          { value: 'connection', label: 'CLIENTS.FIELDS.CONNECTION' }
        ],
        icon: 'filter_list'
      },
      company: {
        label: 'CLIENTS.FIELDS.COMPANY',
        options: companyOptions,
        placeholder: 'CLIENTS.PLACEHOLDERS.SELECT_COMPANY',
        icon: 'business',
        required: true
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
    this.selectedClient.set(client);
    this.onEditClient(client);
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
          this.clearForm();
        }

        // Recarrega os dados para atualizar a lista
        await this.loadData();
        this.updateConfigs();

      } catch (error) {
        console.error('❌ Erro ao salvar cliente:', error);
        //! NOTIFICAÇÃO: Erro ao salvar cliente
      }
    } else {
      this.clientForm.markAllAsTouched();

      //! NOTIFICAÇÃO: Preencha todos os campos obrigatórios
   
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
            this.selectedClient.set(null);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao excluir cliente:', error);
          //! Notificação de erro 
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
    this.clearForm();
  }

  private updateConfigs() {
    // Atualiza as opções de empresas
    this.selectConfigs = this.buildSelectConfigs();
    this.cdr.detectChanges();
  }
}