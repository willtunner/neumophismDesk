import { Component, inject, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { SelectDynamicComponent } from '../../shared/components/select-dynamic/select-dynamic';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectConfig } from '../../interfaces/select-config.interface';
import { ButtonDynamic } from '../../shared/components/button-dynamic/button-dynamic';
import { RichTextConfig } from '../../interfaces/rich-text-config.interface';
import { InputConfig } from '../../interfaces/input-config.interface';
import { InputType } from '../../enuns/input-types.enum';
import { InputDynamicComponent } from '../../shared/components/input-dynamic/input-dynamic';
import { RichTextDynamicComponent } from '../../shared/components/rich-text-dynamic/rich-text-dynamic';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TagsNeuComponent } from '../../shared/components/tags-neu/tags-neu';
import { CompanyService } from '../../services/company';
import { Company, User } from '../../models/models';
import { ClientService } from '../../services/client';

@Component({
  selector: 'app-call',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectDynamicComponent,
    ButtonDynamic,
    InputDynamicComponent,
    RichTextDynamicComponent,
    TranslateModule,
    TagsNeuComponent
  ],
  templateUrl: './call.html',
  styleUrl: './call.css'
})
export class Call implements OnInit, OnDestroy {
  callForm: FormGroup;
  private langChangeSubscription!: Subscription;
  companies: Company[] = [];
  clients: User[] = [];
  isConfigsReady = false;
  isLoadingClients = false;

  //? Configurações dos componentes
  inputConfigs: any = {};
  selectConfigs: any = {};
  richTextConfig!: RichTextConfig;

  //? Serviços
  private companyService = inject(CompanyService);
  private clientService = inject(ClientService);
  private cdr = inject(ChangeDetectorRef);

  // Ícones SVG
  readonly addIcon = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  `;

  readonly searchIcon = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  `;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService
  ) {
    this.callForm = this.fb.group({
      companyId: ['', Validators.required],
      cliente: ['', Validators.required],
      conexao: [''],
      titulo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      descricao: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      conteudo: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(5000)]],
      tags: [[], Validators.required],
    });

    // Observa mudanças no campo empresa para carregar clientes
    this.setupEmpresaChangeListener();
  }

  async ngOnInit() {
    // Carrega as empresas primeiro
    await this.loadCompanies();
    
    // Aguarda as traduções estarem prontas antes de inicializar as configurações
    this.translate.get(['INPUTS-FIELS.COMPANY', 'INPUTS-FIELS.CLIENT']).subscribe(() => {
      this.initializeConfigs();
    });

    // Inscreve-se nas mudanças de idioma
    this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateTranslations();
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  /**
   * Configura o listener para mudanças no campo empresa
   */
  private setupEmpresaChangeListener(): void {
    this.empresaControl.valueChanges.subscribe(async (empresaId: string) => {
      console.log('🏢 Empresa selecionada:', empresaId);
      
      if (empresaId) {
        await this.loadClientsByEmpresa(empresaId);
      } else {
        // Limpa os clientes se nenhuma empresa for selecionada
        console.log('🧹 Limpando clientes (empresa vazia)');
        this.clients = [];
        this.updateClientOptions();
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Carrega as empresas do service
   */
  private async loadCompanies(): Promise<void> {
    try {
      this.companies = await this.companyService.loadAllCompanies(false);
      console.log('🏢 Empresas carregadas:', this.companies.length);
    } catch (error) {
      console.error('❌ Erro ao carregar empresas:', error);
      this.companies = [];
    }
  }

  /**
 * Carrega os clientes de uma empresa específica
 */
/**
 * Carrega os clientes de uma empresa específica
 */
private async loadClientsByEmpresa(empresaId: string): Promise<void> {
  try {
    this.isLoadingClients = true;
    this.cdr.detectChanges(); // Força atualização imediata do loading
    
    // Encontra a empresa selecionada
    const empresaSelecionada = this.companies.find(company => company.id === empresaId);
    
    if (!empresaSelecionada) {
      console.warn('❌ Empresa não encontrada:', empresaId);
      this.clients = [];
      this.isLoadingClients = false;
      this.updateClientOptions();
      this.cdr.detectChanges();
      return;
    }

    console.log('🔍 Buscando clientes da empresa:', empresaSelecionada.name);
    console.log('📋 IDs dos clientes:', empresaSelecionada.clientsId);
    
    // Busca os clientes pelos IDs
    const clientIds = empresaSelecionada.clientsId || [];
    
    if (clientIds.length === 0) {
      console.log('ℹ️ Nenhum cliente encontrado para esta empresa');
      this.clients = [];
    } else {
      this.clients = await this.clientService.getClientsByIds(clientIds);
      console.log(`✅ ${this.clients.length} cliente(s) carregado(s) para a empresa "${empresaSelecionada.name}":`, 
        this.clients.map(client => ({id: client.id, name: client.name})));
    }

  } catch (error) {
    console.error('❌ Erro ao carregar clientes:', error);
    this.clients = [];
  } finally {
    this.isLoadingClients = false;
    this.updateClientOptions(); // Chama APÓS definir isLoadingClients como false
    this.cdr.detectChanges();
  }
}

  private initializeConfigs(): void {
    this.updateInputConfigs();
    this.updateSelectConfigs();
    this.updateRichTextConfig();
    this.isConfigsReady = true;
  }

  private updateInputConfigs(): void {
    this.inputConfigs = {
      companyId: {
        type: InputType.TEXT,
        formControlName: 'companyId',
        label: this.getTranslation('INPUTS-FIELS.COMPANY'),
        required: true,
        placeholder: this.getTranslation('INPUTS-FIELS.SELECT_COMPANY'),
        iconName: 'business',
        customErrorMessages: {
          required: this.getTranslation('VALIDATOR-ERROR-MESSAGES.REQUIRED')
        }
      } as InputConfig,

      cliente: {
        type: InputType.TEXT,
        formControlName: 'cliente',
        label: this.getTranslation('INPUTS-FIELS.CLIENT'),
        required: true,
        placeholder: this.isLoadingClients 
          ? 'Carregando clientes...' 
          : this.getTranslation('INPUTS-FIELS.SELECT_CLIENT'),
        iconName: 'person',
        customErrorMessages: {
          required: this.getTranslation('VALIDATOR-ERROR-MESSAGES.REQUIRED')
        }
      } as InputConfig,

      conexao: {
        type: InputType.TEXT,
        formControlName: 'conexao',
        label: this.getTranslation('INPUTS-FIELS.CONECTION'),
        required: false,
        placeholder: this.getTranslation('INPUTS-FIELS.NUMBER_CONECTION_PLACEHOLDER'),
        iconName: 'link'
      } as InputConfig,

      titulo: {
        type: InputType.TEXT,
        formControlName: 'titulo',
        label: this.getTranslation('INPUTS-FIELS.TITLE'),
        required: true,
        placeholder: this.getTranslation('INPUTS-FIELS.PLACEHOLDER_TITLE'),
        iconName: 'title',
        minLength: 2,
        maxLength: 100,
        customErrorMessages: {
          required: this.getTranslation('VALIDATOR-ERROR-MESSAGES.REQUIRED'),
          minlength: this.getTranslationWithParams('VALIDATOR-ERROR-MESSAGES.MINLENGTH', { requiredLength: 2 }),
          maxlength: this.getTranslationWithParams('VALIDATOR-ERROR-MESSAGES.MAXLENGTH', { requiredLength: 100 })
        }
      } as InputConfig,

      descricao: {
        type: InputType.TEXTAREA,
        formControlName: 'descricao',
        label: this.getTranslation('INPUTS-FIELS.DESCRIPTION'),
        required: true,
        placeholder: this.getTranslation('INPUTS-FIELS.PLACEHOLDER_DESCRIPTION'),
        rows: 4,
        minLength: 10,
        maxLength: 500,
        iconName: 'description',
        customErrorMessages: {
          required: this.getTranslation('VALIDATOR-ERROR-MESSAGES.REQUIRED'),
          minlength: this.getTranslationWithParams('VALIDATOR-ERROR-MESSAGES.MINLENGTH', { requiredLength: 10 }),
          maxlength: this.getTranslationWithParams('VALIDATOR-ERROR-MESSAGES.MAXLENGTH', { requiredLength: 500 })
        }
      } as InputConfig
    };
  }

  private getCompanyOptions(): { value: string; label: string }[] {
    if (!this.companies || this.companies.length === 0) {
      return [{ value: '', label: 'Nenhuma empresa encontrada' }];
    }

    return this.companies.map(company => ({
      value: company.id,
      label: company.name
    }));
  }

  private getClientOptions(): { value: string; label: string }[] {
    console.log('📋 Gerando opções de clientes...');
    console.log('⏳ Loading:', this.isLoadingClients);
    console.log('👥 Clientes:', this.clients);
  
    if (this.isLoadingClients) {
      return [{ value: '', label: 'Carregando clientes...' }];
    }
  
    if (!this.clients || this.clients.length === 0) {
      return [{ value: '', label: 'Nenhum cliente encontrado' }];
    }
  
    const options = this.clients.map(client => ({
      value: client.id,
      label: client.name || 'Cliente sem nome'
    }));
  
    console.log('🎯 Opções geradas:', options);
    return options;
  }

  /**
   * Atualiza as opções do select de clientes
   */
  private updateClientOptions(): void {
    console.log('🔄 Atualizando opções do select de clientes...');
    console.log('👥 Clientes disponíveis:', this.clients.length);
    console.log('⏳ Loading:', this.isLoadingClients);
  
    // Cria um NOVO objeto para forçar a detecção de mudanças
    const newSelectConfigs = {
      ...this.selectConfigs,
      cliente: {
        ...this.selectConfigs.cliente,
        options: [...this.getClientOptions()], // Cria um novo array
        placeholder: this.isLoadingClients 
          ? 'Carregando clientes...'
          : this.clients.length === 0 
            ? 'Nenhum cliente encontrado'
            : this.getTranslation('INPUTS-FIELS.SELECT_CLIENT')
      }
    };
  
    // Atualiza a referência completa
    this.selectConfigs = newSelectConfigs;
  
    // Limpa o valor do controle de cliente quando as opções mudam
    setTimeout(() => {
      this.clienteControl.setValue('', { emitEvent: false });
    });
  
    console.log('✅ Select config atualizado:', this.selectConfigs.cliente);
  }

  private updateSelectConfigs(): void {
    this.selectConfigs = {
      empresa: {
        formControlName: 'empresa',
        label: this.getTranslation('INPUTS-FIELS.COMPANY'),
        required: true,
        placeholder: this.getTranslation('INPUTS-FIELS.SELECT_COMPANY'),
        options: this.getCompanyOptions(),
        iconName: 'business',
        customErrorMessages: {
          required: this.getTranslation('VALIDATOR-ERROR-MESSAGES.REQUIRED')
        }
      } as SelectConfig,

      cliente: {
        formControlName: 'cliente',
        label: this.getTranslation('INPUTS-FIELS.CLIENT'),
        required: true,
        placeholder: this.getTranslation('INPUTS-FIELS.SELECT_CLIENT'),
        options: this.getClientOptions(),
        iconName: 'person',
        customErrorMessages: {
          required: this.getTranslation('VALIDATOR-ERROR-MESSAGES.REQUIRED')
        }
      } as SelectConfig,

      conexao: {
        formControlName: 'conexao',
        label: this.getTranslation('INPUTS-FIELS.CONECTION'),
        required: false,
        placeholder: this.getTranslation('INPUTS-FIELS.NUMBER_CONECTION_PLACEHOLDER'),
        options: [
          { value: 'web', label: 'Web' },
          { value: 'mobile', label: 'Mobile' },
          { value: 'desktop', label: 'Desktop' }
        ],
        iconName: 'link'
      } as SelectConfig
    };
  }

  private updateRichTextConfig(): void {
    this.richTextConfig = {
      formControlName: 'conteudo',
      label: this.getTranslation('INPUTS-FIELS.CONTENT'),
      required: true,
      placeholder: this.getTranslation('INPUTS-FIELS.PLACEHOLDER_CONTENT'),
      minLength: 20,
      maxLength: 5000,
      minHeight: '200px',
      customErrorMessages: {
        required: this.getTranslation('VALIDATOR-ERROR-MESSAGES.REQUIRED'),
        minlength: this.getTranslationWithParams('VALIDATOR-ERROR-MESSAGES.MINLENGTH', { requiredLength: 20 }),
        maxlength: this.getTranslationWithParams('VALIDATOR-ERROR-MESSAGES.MAXLENGTH', { requiredLength: 5000 })
      }
    } as RichTextConfig;
  }

  private updateTranslations(): void {
    // Recria completamente as configurações para garantir que todas as traduções sejam atualizadas
    this.updateInputConfigs();
    this.updateSelectConfigs();
    this.updateRichTextConfig();
  }

  // Método auxiliar para obter traduções
  private getTranslation(key: string): string {
    return this.translate.instant(key);
  }

  // Método auxiliar para obter traduções com parâmetros
  private getTranslationWithParams(key: string, params: any): string {
    return this.translate.instant(key, params);
  }

  // Getters para os controles
  get empresaControl(): FormControl {
    return this.callForm.get('companyId') as FormControl;
  }

  get clienteControl(): FormControl {
    return this.callForm.get('cliente') as FormControl;
  }

  get conexaoControl(): FormControl {
    return this.callForm.get('conexao') as FormControl;
  }

  get tituloControl(): FormControl {
    return this.callForm.get('titulo') as FormControl;
  }

  get descricaoControl(): FormControl {
    return this.callForm.get('descricao') as FormControl;
  }

  get conteudoControl(): FormControl {
    return this.callForm.get('conteudo') as FormControl;
  }

  // Métodos para os botões
  onAddEmpresa(): void {
    console.log('Abrir modal para adicionar empresa');
  }

  onAddCliente(): void {
    console.log('Abrir modal para adicionar cliente');
  }

  onSearchConexao(): void {
    console.log('Buscar conexão');
  }

  onSubmit(): void {
    if (this.callForm.valid) {
      const formValue = this.callForm.value;
      
  
      console.log('📤 Dados do chamado para enviar:', formValue);
      
      // Aqui você chamaria o serviço para salvar o chamado
      // await this.callService.saveCall(callData);
      
    } else {
      this.markAllAsTouchedAndDirty();
      console.log('❌ Formulário inválido');
    }
  }

  

  private markAllAsTouchedAndDirty(): void {
    Object.keys(this.callForm.controls).forEach(key => {
      const control = this.callForm.get(key);
      if (control) {
        control.markAsTouched();
        control.markAsDirty();
        control.updateValueAndValidity();
      }
    });

    this.forceRichTextValidation();
  }

  private forceRichTextValidation(): void {
    this.conteudoControl.updateValueAndValidity();
    this.conteudoControl.markAsTouched();
    this.conteudoControl.markAsDirty();
  }
  

  get tagsControl(): FormControl {
    if (this.callForm.contains('tags')) {
      return this.callForm.get('tags') as FormControl;
    } else {
      const tagsControl = new FormControl([], { nonNullable: true });
      return tagsControl;
    }
  }
}