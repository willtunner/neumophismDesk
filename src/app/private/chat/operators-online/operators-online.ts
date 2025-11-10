import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

interface Atendimento {
  nome: string;
  empresa: string;
  assunto: string;
  finalized: boolean;
}

interface Operador {
  nome: string;
  atendimentos: Atendimento[];
  dropdownOpen?: boolean;
  assuntoSelecionado?: string;
}

@Component({
  selector: 'app-operators-online',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './operators-online.html',
  styleUrls: ['./operators-online.css']
})
export class OperatorsOnlineComponent {
  displayedColumns = ['nome', 'empresa', 'assunto'];

  operadores: Operador[] = [
    {
      nome: 'William',
      atendimentos: [
        { nome: 'Sueli', empresa: 'Posto AZ', assunto: 'DFE', finalized: true },
        { nome: 'Jonas', empresa: 'Posto KM23', assunto: 'TEF', finalized: false }
      ],
      assuntoSelecionado: 'DFE'
    },
    {
      nome: 'Whasigton',
      atendimentos: [
        { nome: 'Carlos', empresa: 'Banco XP', assunto: 'Corrupção Banco', finalized: false },
        { nome: 'Amanda', empresa: 'Posto JK', assunto: 'Corrupção Banco', finalized: false }
      ],
      assuntoSelecionado: 'Corrupção Banco'
    },
    {
      nome: 'Erisvaldo',
      atendimentos: []
    }
  ];

  toggleDropdown(operador: Operador) {
    operador.dropdownOpen = !operador.dropdownOpen;
  }

  getFinalizados(operador: Operador): number {
    return operador.atendimentos.filter(a => a.finalized).length;
  }
}
