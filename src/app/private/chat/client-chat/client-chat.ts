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
  isLoggedIn = false;
  newMessage = '';
  messages: { sender: string; text: string }[] = [];

  toggleLogin() {
    this.isLoggedIn = !this.isLoggedIn;
    if (!this.isLoggedIn) {
      this.messages = [];
      this.newMessage = '';
    }
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({ sender: 'cliente', text: this.newMessage });
      this.newMessage = '';
      // resposta simulada
      setTimeout(() => {
        this.messages.push({ sender: 'operador', text: 'Mensagem recebida!' });
      }, 800);
    }
  }
}
