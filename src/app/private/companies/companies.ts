// companies.ts - VERSÃO CORRIGIDA
import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { SelectDynamicComponent } from '../../shared/components/select-dynamic/select-dynamic';
import { InputDynamicComponent } from '../../shared/components/input-dynamic/input-dynamic';
import { DynamicTableComponent } from '../../shared/components/dynamic-table/dynamic-table';

import { Company, User } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { CompanyService } from '../../services/company';
import { NotificationService } from '../../services/notification';
import { NotificationTitle, NotificationType } from '../../enuns/notification-icon-types.enum';
import { buildInputConfigs } from './util/companies-input-config.factory';
import { buildSelectConfigs } from './util/companies-select-config.factory';

@Component({
  selector: 'app-companies',
  standalone: true,
  templateUrl: './companies.html',
  styleUrl: './companies.css',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    SelectDynamicComponent,
    InputDynamicComponent,
    DynamicTableComponent
  ]
})
export class Companies implements OnInit, OnDestroy {

  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);
  private auth = inject(AuthService);
  private companyService = inject(CompanyService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  private langSub!: Subscription;
  private loggedUser!: User;

  // 🔹 HEADERS PARA A DYNAMIC TABLE
  tableHeaders = [
    { label: 'COMPANIES.FIELDS.NAME', field: 'name' },
    { label: 'COMPANIES.FIELDS.CNPJ', field: 'cnpj' },
    { label: 'COMPANIES.FIELDS.EMAIL', field: 'email' },
    { label: 'COMPANIES.FIELDS.CITY', field: 'city' },
    { label: 'COMPANIES.FIELDS.STATE', field: 'state' },
    { label: 'COMPANIES.FIELDS.CREATED', field: 'created' }
  ];

  // 🔹 SIGNAL PARA LINHA SELECIONADA
  selectedCompany = signal<Company | null>(null);

  // Forms
  filterForm!: FormGroup;
  companyForm!: FormGroup;

  // Signals
  companies = this.companyService.companies;
  filteredCompanies = signal<Company[]>([]);
  
  // Estados
  isLoading = false;
  isConfigsReady = false;
  isEditing = false;
  currentCompanyId = signal<string | null>(null);

  // Configurações
  inputConfigs: any = {};
  selectConfigs: any = {};

  // Controles para datas
  startDateControl = new FormControl('');
  endDateControl = new FormControl('');

  async ngOnInit() {
    this.loggedUser = this.auth.currentUser()!;
    this.initForms();
    
    // 🔹 ORDEM CORRETA: Primeiro configura os listeners, depois carrega os dados
    this.setupRouteListener();
    this.initializeConfigs();
    
    await this.loadCompanies();

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

    // Formulário da empresa
    this.companyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      cnpj: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipcode: ['', [Validators.required]],
      connectionServ: ['', [Validators.required]],
      versionServ: [''],
      keywords: [[]]
    });

    // Listener para filtros
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
    
    // Listener para datas
    this.startDateControl.valueChanges.subscribe(() => this.applyFilters());
    this.endDateControl.valueChanges.subscribe(() => this.applyFilters());
  }

  private setupRouteListener() {
    this.route.paramMap.subscribe(async (params) => {
      const companyId = params.get('id');
      console.log('🔄 Route param changed:', companyId);
      
      if (companyId) {
        await this.selectCompanyById(companyId);
      } else {
        this.clearFormAndSelection();
      }
    });
  }

  private async loadCompanies() {
    try {
      this.isLoading = true;
      await this.companyService.loadAllCompanies();
      this.applyFilters();
      
      // 🔹 VERIFICA SE HÁ ID NA URL APÓS CARREGAR OS DADOS
      const initialCompanyId = this.route.snapshot.paramMap.get('id');
      if (initialCompanyId) {
        await this.selectCompanyById(initialCompanyId);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar empresas:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private async selectCompanyById(companyId: string) {
    try {
      console.log('🔍 Procurando empresa com ID:', companyId);
      
      // 🔹 PRIMEIRO: Encontra a empresa nos dados atuais (incluindo filtros)
      let company = this.findCompanyInData(companyId);
      
      // 🔹 SEGUNDO: Se não encontrou, tenta carregar pelo service
      if (!company) {
        console.log('⚠️ Empresa não encontrada nos dados locais, buscando no service...');
        company = await this.companyService.getCompanyById(companyId);
      }
      
      if (company) {
        console.log('✅ Empresa encontrada:', company.name);
        this.setSelectedCompany(company);
      } else {
        console.warn('❌ Empresa não encontrada com ID:', companyId);
        this.clearSelection();
      }
    } catch (error) {
      console.error('❌ Erro ao selecionar empresa:', error);
      this.clearSelection();
    }
  }

  private findCompanyInData(companyId: string): Company | null {
    // 🔹 PROCURA PRIMEIRO NOS DADOS FILTRADOS
    let company = this.filteredCompanies().find(c => c.id === companyId) || null;
    
    // 🔹 SE NÃO ENCONTRAR, PROCURA EM TODOS OS DADOS
    if (!company) {
      company = this.companies().find(c => c.id === companyId) || null;
    }
    
    return company;
  }

  private setSelectedCompany(company: Company) {
    this.selectedCompany.set(company);
    this.populateForm(company);
    this.currentCompanyId.set(company.id);
    this.isEditing = true;
    
    console.log('🎯 Empresa selecionada na tabela:', company.name);
    
    // 🔹 FORÇA A ATUALIZAÇÃO DA UI
    this.cdr.detectChanges();
  }

  private clearSelection() {
    this.selectedCompany.set(null);
    this.currentCompanyId.set(null);
    this.isEditing = false;
    this.cdr.detectChanges();
  }

  private clearFormAndSelection() {
    this.companyForm.reset();
    this.clearSelection();
  }

  private populateForm(company: Company) {
    this.companyForm.patchValue({
      name: company.name,
      cnpj: company.cnpj,
      email: company.email,
      phone: company.phone,
      address: company.address,
      city: company.city,
      state: company.state,
      zipcode: company.zipcode,
      connectionServ: company.connectionServ,
      versionServ: company.versionServ,
      keywords: company.keywords || []
    });
  }

  private applyFilters() {
    const filters = this.filterForm.value;
    const startDate = this.startDateControl.value;
    const endDate = this.endDateControl.value;
    
    let filtered = this.companies();

    // Filtro por texto
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(company => {
        switch (filters.filterField) {
          case 'name':
            return company.name.toLowerCase().includes(searchTerm);
          case 'cnpj':
            return company.cnpj.toLowerCase().includes(searchTerm);
          case 'city':
            return company.city.toLowerCase().includes(searchTerm);
          case 'state':
            return company.state.toLowerCase().includes(searchTerm);
          case 'email':
            return company.email.toLowerCase().includes(searchTerm);
          case 'versionServ':
            return company.versionServ?.toLowerCase().includes(searchTerm) || false;
          default:
            return true;
        }
      });
    }

    // Filtro por data
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(company => new Date(company.created) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter(company => new Date(company.created) <= end);
    }

    this.filteredCompanies.set(filtered);
    
    // 🔹 VERIFICA SE A EMPRESA SELECIONADA AINDA ESTÁ NOS DADOS FILTRADOS
    const selected = this.selectedCompany();
    if (selected && !filtered.some(c => c.id === selected.id)) {
      console.log('⚠️ Empresa selecionada não está mais nos dados filtrados');
      this.clearSelection();
    }
  }

  private initializeConfigs() {
    this.inputConfigs = buildInputConfigs(this.translate);
    this.selectConfigs = buildSelectConfigs(this.translate);
    this.isConfigsReady = true;
  }

  // 🔹 MÉTODOS PARA A DYNAMIC TABLE
  onTableRowClick(company: Company) {
    console.log('🖱️ Clicou na linha:', company.name);
    this.setSelectedCompany(company);
    this.router.navigate(['/companies', company.id]);
  }

  onSelectedRowChange(company: Company | null) {
    this.selectedCompany.set(company);
  }

  // Getters para os controles (mantidos iguais)
  get searchControl(): FormControl { return this.filterForm.get('search') as FormControl; }
  get filterFieldControl(): FormControl { return this.filterForm.get('filterField') as FormControl; }
  get nameControl(): FormControl { return this.companyForm.get('name') as FormControl; }
  get cnpjControl(): FormControl { return this.companyForm.get('cnpj') as FormControl; }
  get emailControl(): FormControl { return this.companyForm.get('email') as FormControl; }
  get phoneControl(): FormControl { return this.companyForm.get('phone') as FormControl; }
  get addressControl(): FormControl { return this.companyForm.get('address') as FormControl; }
  get cityControl(): FormControl { return this.companyForm.get('city') as FormControl; }
  get stateControl(): FormControl { return this.companyForm.get('state') as FormControl; }
  get zipcodeControl(): FormControl { return this.companyForm.get('zipcode') as FormControl; }
  get connectionServControl(): FormControl { return this.companyForm.get('connectionServ') as FormControl; }
  get versionServControl(): FormControl { return this.companyForm.get('versionServ') as FormControl; }
  get keywordsControl(): FormControl { return this.companyForm.get('keywords') as FormControl; }

  async onSubmit() {
    if (this.companyForm.valid) {
      try {
        const companyData = this.companyForm.value;

        if (this.isEditing && this.currentCompanyId()) {
          // Atualizar empresa existente
          await this.companyService.updateCompany(this.currentCompanyId()!, companyData);
          this.notificationService.createNotification(
            NotificationTitle.UPDATE_COMPANY,
            NotificationType.SUCCESS,
            'Empresa atualizada com sucesso!',
            false,
            `/companies/${this.currentCompanyId()}`
          );
          
          // 🔹 ATUALIZA A SELEÇÃO APÓS EDIÇÃO
          const updatedCompany = await this.companyService.getCompanyById(this.currentCompanyId()!);
          if (updatedCompany) {
            this.setSelectedCompany(updatedCompany);
          }
        } else {
          // Criar nova empresa
          const newCompany = await this.companyService.saveCompany(companyData);
          this.notificationService.createNotification(
            NotificationTitle.CREATE_COMPANY,
            NotificationType.SUCCESS,
            'Empresa criada com sucesso!',
            false,
            `/companies/${newCompany.id}`
          );
          
          // 🔹 SELECIONA A NOVA EMPRESA
          this.setSelectedCompany(newCompany);
          this.router.navigate(['/companies', newCompany.id]);
        }

        // Recarrega os dados para atualizar a lista
        await this.loadCompanies();
        
      } catch (error) {
        console.error('❌ Erro ao salvar empresa:', error);
      }
    } else {
      this.companyForm.markAllAsTouched();
    }
  }

  onEditCompany(company: Company) {
    this.router.navigate(['/companies', company.id]);
  }

  async onDeleteCompany(company: Company) {
    if (confirm(`Tem certeza que deseja excluir a empresa ${company.name}?`)) {
      try {
        const success = await this.companyService.deleteCompany(company.id);
        if (success) {
          this.notificationService.createNotification(
            NotificationTitle.DELETED_COMPANY,
            NotificationType.SUCCESS,
            'Empresa excluída com sucesso!',
            false,
            null
          );
          
          // Recarrega a lista
          await this.loadCompanies();
          
          // Limpa seleção se a empresa excluída era a selecionada
          if (this.selectedCompany()?.id === company.id) {
            this.clearFormAndSelection();
            this.router.navigate(['/companies']);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao excluir empresa:', error);
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

  onNewCompany() {
    this.router.navigate(['/companies']);
    this.clearFormAndSelection();
  }

  private updateConfigs() {
    this.cdr.detectChanges();
  }
}