import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-client-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-chat.html',
  styleUrls: ['./client-chat.scss']
})
export class ClientChat {
  client = {
    nome: 'Fabiana Golveia',
    empresa: 'Posto Dantop',
    cnpj: '13.670.585/0001-07',
    status: true, // true = online (verde), false = offline (vermelho)
    foto: 'https://static.vecteezy.com/ti/fotos-gratis/p2/3491968-imagem-retrato-de-mulher-linda-encantadora-close-up-gratis-foto.jpg'
  };

  toggleStatus() {
    this.client.status = !this.client.status;
  }
}
