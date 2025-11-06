import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  text: string;
  time: string;
  sender: 'client' | 'operator';
}

@Component({
  selector: 'app-chat-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-messages.html',
  styleUrls: ['./chat-messages.scss']
})
export class ChatMessagesComponent {
  messages: ChatMessage[] = [
    { text: 'Olá, boa tarde!', time: '14:05', sender: 'client' },
    { text: 'Boa tarde! Em que posso ajudar?', time: '14:06', sender: 'operator' },
    { text: 'Estou com diferença no caixa.', time: '14:07', sender: 'client' }
  ];

  newMessage = '';

  sendMessage() {
    if (!this.newMessage.trim()) return;

    this.messages.push({
      text: this.newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'client'
    });

    this.newMessage = '';

    setTimeout(() => {
      const area = document.querySelector('.messages-area');
      if (area) area.scrollTop = area.scrollHeight;
    }, 50);
  }
}
