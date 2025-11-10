import { Component } from '@angular/core';
import { WaitingListComponent } from '../waiting-list/waiting-list';
import { OperatorsOnlineComponent } from '../operators-online/operators-online';
import { WaitingListClientsComponent } from '../waiting-list-clients/waiting-list-clients';
import { ChatMessagesComponent } from '../chat-messages/chat-messages';

@Component({
  selector: 'app-operator-list',
  imports: [
    WaitingListComponent, 
    OperatorsOnlineComponent, 
    WaitingListClientsComponent,
    ChatMessagesComponent
  ],
  templateUrl: './operator-list.html',
  styleUrl: './operator-list.css'
})
export class OperatorList {

}
