import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private apiUrl = 'http://localhost:3000/api'; // Backend local

  constructor(private http: HttpClient) {}

  // Mantém a mesma assinatura, mas ignora o parâmetro 'from'
  getNews(q: string, from: string): Observable<any> {
    // Usa apenas o parâmetro 'q', ignora 'from' para compatibilidade
    const params = new HttpParams().set('q', q);

    console.log('📡 Buscando notícias via backend NewsData.io:', { q });

    return this.http.get(`${this.apiUrl}/news`, { params });
  }
}