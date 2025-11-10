import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-waiting-list',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './waiting-list.html',
  styleUrls: ['./waiting-list.css'],
})
export class WaitingListComponent {
  displayedColumns: string[] = ['nome', 'empresa', 'assunto', 'tempo'];

  waitingList = [
    { nome: 'Fabiana', empresa: 'Dantop', assunto: 'DFE', tempo: '2min' },
    { nome: 'Weter', empresa: 'Posto Caj...', assunto: 'IMPRESSORA', tempo: '2min' },
    { nome: 'Lucas', empresa: 'Km 23', assunto: 'NFCE', tempo: '2min' },
  ];

  operadoresLivres = 1;
}
