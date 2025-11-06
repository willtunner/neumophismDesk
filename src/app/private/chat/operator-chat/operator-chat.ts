import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Operator {
  nome: string;
  cargo: string;
  online: boolean;
  foto: string;
}

@Component({
  selector: 'app-operator-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './operator-chat.html',
  styleUrl: './operator-chat.css'
})



export class OperatorChat {
  // Para testar o estado de operador null, altere para:
  // operator: Operator | null = null;
  // Para testar operador offline: operator = { nome: 'William', cargo: 'MTB', online: false, foto: '...' };
  // Para testar operador online: mantenha como está abaixo
  
  operator = {
    nome: 'William',
    cargo: 'MTB',
    online: false,
    foto: 'https://media.istockphoto.com/id/1289461335/pt/foto/portrait-of-a-handsome-black-man.jpg?s=612x612&w=0&k=20&c=09FjWjTMXXpVZeSABVtZKG0QBfZWKnu-i0rmnIjbhDY='
  };
}