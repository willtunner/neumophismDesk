import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import cardsData from './cards.json';



interface StatusCard {
  title: string;
  count: number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-status-cards',
  imports: [CommonModule],
  templateUrl: './status-cards.html',
  styleUrl: './status-cards.css'
})
export class StatusCards {

  cards: StatusCard[] = [
    {
      title: 'Clientes',
      count: 1248,
      icon: 'people',
      color: 'linear-gradient(135deg, #667eea, #764ba2)'
    },
    {
      title: 'Chamados Abertos',
      count: 42,
      icon: 'warning',
      color: 'linear-gradient(135deg, #ffa726, #ff9800)'
    },
    {
      title: 'Chamados Fechados',
      count: 1893,
      icon: 'check_circle',
      color: 'linear-gradient(135deg, #66bb6a, #4caf50)'
    },
    {
      title: 'Todos os Chamados',
      count: 1935,
      icon: 'assignment',
      color: 'linear-gradient(135deg, #42a5f5, #2196f3)'
    }
  ];

  getSafeSvg(svgString: string): any {
    // Usando DomSanitizer seria mais seguro, mas para este exemplo vamos retornar diretamente
    return svgString;
  }


}
