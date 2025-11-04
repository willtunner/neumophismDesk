// chat.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperatorChat } from './operator-chat/operator-chat';
import { ClientChat } from './client-chat/client-chat';
import { User } from '../../models/models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, OperatorChat, ClientChat ],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  loggedUser!: User;

  private auth = inject(AuthService);

  ngOnInit(): void {
    this.loggedUser = this.auth.currentUser()!;
    console.log('Usuário logado:', this.loggedUser);
  }

  ngOnDestroy() {

  }

  isClientView(): boolean {
    if (this.loggedUser.roles.includes('CLIENT')) {
      return true;
    }
    return false;
  }

  

}