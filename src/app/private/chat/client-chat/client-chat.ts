import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SupportModalComponent, SupportSelection } from '../support-modal/support-modal';
import { AuthService } from '../../../services/auth.service';
import { User, Company, Client } from '../../../models/models';

@Component({
  selector: 'app-client-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-chat.html',
  styleUrls: ['./client-chat.scss']
})
export class ClientChat implements OnInit {
  private auth = inject(AuthService);
  private dialog = inject(MatDialog);

  // Inicializar com valores padrão para evitar undefined
  loggedUser: User | null = null;
  isLoading = true;

  client = {
    nome: '',
    empresa: '',
    cnpj: '',
    status: false,
    foto: 'https://static.vecteezy.com/ti/fotos-gratis/p2/3491968-imagem-retrato-de-mulher-linda-encantadora-close-up-gratis-foto.jpg'
  };

  constructor() {}

  async ngOnInit() {
    try {
      const currentUser = this.auth.currentUser();
      
      if (currentUser) {
        // Popula os dados do usuário
        this.loggedUser = await this.auth.populateObjectRelations(currentUser);
        console.log('Logged User', this.loggedUser);
        
        // Atualiza os dados do client baseado no usuário logado
        this.updateClientData();
      } else {
        console.warn('Nenhum usuário logado encontrado');
        // Usar dados padrão como fallback
        this.setDefaultClientData();
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      this.setDefaultClientData();
    } finally {
      this.isLoading = false;
    }
  }

  private updateClientData(): void {
    if (!this.loggedUser) return;

    // Usar dados reais do usuário logado
    this.client.nome = this.loggedUser.name;
    
    // Tentar obter dados da company do helpDeskCompany
    const company = this.getUserCompany();
    
    if (company) {
      this.client.empresa = company.name;
      this.client.cnpj = company.cnpj;
    } else {
      // Fallback para dados padrão se não encontrar company
      this.client.empresa = 'Empresa não definida';
      this.client.cnpj = 'CNPJ não disponível';
    }

    // Status baseado no isLoggedIn do usuário
    this.client.status = this.loggedUser.isLoggedIn;
  }

  private setDefaultClientData(): void {
    // Dados padrão como fallback
    this.client = {
      nome: 'Usuário',
      empresa: 'Empresa não definida',
      cnpj: 'CNPJ não disponível',
      status: false,
      foto: 'https://static.vecteezy.com/ti/fotos-gratis/p2/3491968-imagem-retrato-de-mulher-linda-encantadora-close-up-gratis-foto.jpg',
    };
  }

  private getUserCompany(): Company | null {
    if (!this.loggedUser) return null;

    // Tentar obter company do helpDeskCompany
    if (this.loggedUser.helpDeskCompany?.companies?.length) {
      return this.loggedUser.helpDeskCompany.companies[0];
    }

    // Tentar obter company diretamente do usuário
    if (this.loggedUser.company) {
      return this.loggedUser.company;
    }

    return null;
  }

  // Métodos para o template acessar os dados de forma segura
  getCompanyName(): string {
    const company = this.getUserCompany();
    return company?.name || this.client.empresa;
  }

  // getCompanyCnpj(): string {
  //   return this.loggedUser?.company?.cnpj || 'Sem CNPJ';
  // }

  toggleStatus() {
    if (!this.client.status) {
      this.openSupportModal();
    } else {
      this.client.status = !this.client.status;
      // Aqui você pode atualizar o status no backend se necessário
      this.updateUserStatus();
    }
  }

  private updateUserStatus(): void {
    // Atualizar o status do usuário no objeto loggedUser
    if (this.loggedUser) {
      this.loggedUser.isLoggedIn = this.client.status;
      // Aqui você pode chamar um serviço para atualizar no backend
    }
  }

  openSupportModal(): void {
    // const dialogData: SupportModalData = {
    //   clientData: {
    //     ...this.client,
    //     nome: this.loggedUser?.name || this.client.nome,
    //     empresa: this.getCompanyName(),
    //     cnpj: this.loggedUser?.company?.cnpj || 'Sem CNPJ'
    //   }
    // };

    const dialogRef = this.dialog.open(SupportModalComponent, {
      width: '500px',
      // data: dialogData,
      disableClose: true,
      panelClass: 'support-modal-panel'
    });

    dialogRef.afterClosed().subscribe((result: SupportSelection | undefined) => {
      if (result) {
        console.log('Resultado da modal:', result);
        this.client.status = true;
        this.updateUserStatus();
      
        const dataFormated = {
          nome: this.loggedUser?.name,
          empresa: this.loggedUser?.company?.name,
          occurrence: result.assunto,
          timestamp: result.horario,
          idCliente: this.loggedUser?.id
        }
        
        console.log('Dados para occurrence:', dataFormated);
      } else {
        console.log('Modal fechada sem seleção');
        this.client.status = false;
        this.updateUserStatus();
      }
    });
  }
}