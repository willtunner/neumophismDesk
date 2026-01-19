import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SupportModalComponent, SupportSelection } from '../support-modal/support-modal';
import { AuthService } from '../../../services/auth.service';
import { Company, Client, WaintingListClients } from '../../../models/models';
import { Chat2Service } from '../../../services/chat2-service';

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
  private chat2Service = inject(Chat2Service); // Injete o serviço

  // Inicializar com valores padrão para evitar undefined
  loggedUser: Client | null = null;
  isLoading = true;

  client = {
    nome: '',
    empresa: '',
    cnpj: '',
    status: false,
    foto: 'https://static.vecteezy.com/ti/fotos-gratis/p2/3491968-imagem-retrato-de-mulher-linda-encantadora-close-up-gratis-foto.jpg'
  };

  constructor() { }

  async ngOnInit() {
    try {
      const currentUser = this.auth.currentUser();

      if (currentUser) {
        // Popula os dados do usuário
        this.loggedUser = await this.auth.populateObjectRelations(currentUser) as Client;
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

  // E no toggleStatus(), atualize para async:
async toggleStatus() {
  if (!this.client.status) {
    this.openSupportModal();
  } else {
    this.client.status = !this.client.status;
    // Quando o usuário clica em sair, remove da lista de espera
    if (this.loggedUser && !this.client.status) {
      try {
        await this.chat2Service.removeClientFromWaitingList(this.loggedUser.id);
        console.log('✅ Cliente removido da lista de espera');
      } catch (error) {
        console.error('❌ Erro ao remover cliente:', error);
      }
    }
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

  // No método openSupportModal(), atualize a parte onde adiciona o cliente:
openSupportModal(): void {
  const dialogRef = this.dialog.open(SupportModalComponent, {
    width: '500px',
    disableClose: true,
    panelClass: 'support-modal-panel'
  });

  dialogRef.afterClosed().subscribe(async (result: SupportSelection | undefined) => {
    if (result) {
      console.log('Resultado da modal:', result);
      this.client.status = true;
      this.updateUserStatus();

      if (this.loggedUser) {
        const dataFormated: WaintingListClients = {
          name: this.loggedUser.name,
          occurrence: result.assunto,
          timestamp: result.horario,
          client: this.loggedUser
        };

        console.log('Adicionando cliente à lista de espera:', dataFormated);

        try {
          //! Adiciona o cliente na lista de espera no signal E no Firebase
          await this.chat2Service.addClientToWaitingList(dataFormated);
          console.log('✅ Cliente adicionado à lista de espera e Firebase');
        } catch (error) {
          console.error('❌ Erro ao adicionar cliente à lista de espera:', error);
        }

        console.log('Dados para occurrence:', dataFormated);

        
      }
    } else {
      console.log('Modal fechada sem seleção');
      this.client.status = false;
      this.updateUserStatus();
    }
  });
}



  // Método para quando o componente for destruído (opcional)
  ngOnDestroy() {
    // Se quiser remover o cliente da lista quando o componente for destruído
    // if (this.loggedUser) {
    //   this.chat2Service.removeClientFromWaitingList(this.loggedUser.id);
    // }
  }

  getCompanyCnpj(): string {
  if (!this.loggedUser?.company?.cnpj) {
    return 'CNPJ não disponível';
  }
  return this.loggedUser.company.cnpj;
}
}