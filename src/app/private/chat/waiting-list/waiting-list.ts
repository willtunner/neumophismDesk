import { Component, inject, OnDestroy, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { Chat2Service } from '../../../services/chat2-service';
import { WaintingListClients } from '../../../models/models';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-waiting-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatTooltipModule ],
  templateUrl: './waiting-list.html',
  styleUrls: ['./waiting-list.css'],
})
export class WaitingListComponent implements OnInit, OnDestroy {
  private chat2Service = inject(Chat2Service);

  waitingListClients = this.chat2Service.waintingListClients;
  displayedColumns: string[] = ['nome', 'empresa', 'assunto', 'tempo'];

  // Dados convertidos do Firebase para a tabela
  dataSource: any[] = [];

  // Dados mock de fallback
  waitingList: WaintingListClients[] = [];

  operadoresLivres = 1;

  private timeUpdateInterval: any;

  constructor() {
    // Effect para monitorar mudanças no signal
    effect(() => {
      const clients = this.waitingListClients();
      this.waitingList = clients;
      console.log('🔄 Lista de espera atualizada:', clients);
    });
  }

  ngOnInit() {
    console.log('✅ WaitingListComponent iniciado');
    this.startTimeUpdates();
  }

  // Função para clique na linha
  onRowClick(row: WaintingListClients): void {
    console.log('🖱️ Linha clicada:', row);
    // Aqui você pode adicionar mais lógica, como:
    // - Abrir um modal com detalhes
    // - Iniciar um atendimento
    // - Navegar para outra página
  }

  // Função para iniciar atualizações de tempo em tempo real
  private startTimeUpdates(): void {
    this.timeUpdateInterval = setInterval(() => {
      // Força a atualização do template chamando change detection
      // Isso fará com que o formatTime() seja recalculado para cada item
      this.waitingList = [...this.waitingList];
    }, 1000); // Atualiza a cada segundo
  }

  // Função formatada para receber o timestamp do Firebase
  formatTime(timestamp: any): string {
    if (!timestamp) return 'Agora';

    const date = this.convertFirebaseTimestamp(timestamp);
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - date.getTime()); // Garante que não seja negativo

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffSeconds < 60) return `${diffSeconds}s`;
    if (diffMinutes < 60) return `${diffMinutes}min`;
    if (diffHours < 24) {
      const remainingMinutes = diffMinutes % 60;
      return remainingMinutes > 0 ? `${diffHours}h${remainingMinutes}min` : `${diffHours}h`;
    }

    // Para mais de 24 horas, mostra a data
    return date.toLocaleDateString('pt-BR');
  }

  // Converte timestamp do Firebase para Date
  private convertFirebaseTimestamp(timestamp: any): Date {
    if (!timestamp) return new Date();

    // Se for um objeto do Firebase Timestamp
    if (timestamp.seconds !== undefined && timestamp.nanoseconds !== undefined) {
      return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    }

    // Se já for uma string ou Date
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }

    // Se for um objeto Date
    if (timestamp instanceof Date) {
      return timestamp;
    }

    // Fallback
    return new Date();
  }

  ngOnDestroy() {
    console.log('🔴 WaitingListComponent destruído');
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
  }
}