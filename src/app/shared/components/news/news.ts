import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NewsService } from '../../../services/news.service.ts';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './news.html',
  styleUrls: ['./news.css']
})
export class NewsComponent implements OnInit {
  articles: any[] = [];
  query = 'ti'; // Valor padrão para TI
  fromDate: string = '2025-10-10'; // Data fixa como na URL que funciona
  loading = false;
  error: string = '';

  constructor(private newsService: NewsService) {}

  ngOnInit() {
    this.loadNews();
  }

  loadNews() {
    this.loading = true;
    this.error = '';
    
    const q = this.query.trim() || 'ti';
    const from = this.fromDate;

    console.log('Buscando notícias:', { q, from });

    this.newsService.getNews(q, from).subscribe({
      next: (data) => {
        console.log('Dados recebidos da API:', data);
        this.articles = data.articles || [];
        this.loading = false;
        
        if (this.articles.length === 0) {
          this.error = 'Nenhuma notícia encontrada para sua busca.';
        }
      },
      error: (err) => {
        console.error('Erro ao buscar notícias:', err);
        this.loading = false;
        this.articles = [];
        
        if (err.status === 0) {
          this.error = 'Erro de conexão. Verifique se você está executando com: ng serve --proxy-config proxy.conf.json';
        } else if (err.status === 426) {
          this.error = 'É necessário ativar o proxy CORS. Acesse: https://cors-anywhere.herokuapp.com/corsdemo e clique em "Request temporary access to the demo server"';
        } else {
          this.error = `Erro: ${err.message || 'Falha ao carregar notícias'}`;
        }
      }
    });
  }

  openArticle(url: string) {
    window.open(url, '_blank');
  }
}