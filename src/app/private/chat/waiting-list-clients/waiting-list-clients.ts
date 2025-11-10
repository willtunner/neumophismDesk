import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Client {
  nome: string;
  imagemUrl: string;
  assunto: string;
  empresa: string;
  ativo?: boolean;
}

@Component({
  selector: 'app-waiting-list-clients',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './waiting-list-clients.html',
  styleUrls: ['./waiting-list-clients.css']
})
export class WaitingListClientsComponent {

  clients: Client[] = [
    {
      nome: 'Sueli',
      imagemUrl: 'https://i.pravatar.cc/150?img=47',
      assunto: 'DFE',
      empresa: 'Posto AZ',
      ativo: true
    },
    {
      nome: 'Jonas',
      imagemUrl: 'https://i.pravatar.cc/150?img=12',
      assunto: 'TEF',
      empresa: 'Posto KM23',
      ativo: false
    },
    {
      nome: 'Carla',
      imagemUrl: 'https://i.pravatar.cc/150?img=65',
      assunto: 'Balança',
      empresa: 'AutoPosto JK',
      ativo: false
    }
  ];

  setActive(client: Client) {
    this.clients.forEach(c => c.ativo = false);
    client.ativo = true;
  }
}
