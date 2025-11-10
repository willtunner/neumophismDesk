import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private apiKey = '026fbb7f2981493ebfe52849126572cb';
  private apiUrl = '/newsapi/v2/everything';

  constructor(private http: HttpClient) {}

  getNews(q: string, from: string): Observable<any> {
    let params = new HttpParams()
      .set('q', q)
      .set('from', from)
      .set('language', 'pt')
      .set('sortBy', 'publishedAt')
      .set('apiKey', this.apiKey);

    console.log('Fazendo requisição para:', `${this.apiUrl}?${params.toString()}`);
    
    return this.http.get(this.apiUrl, { params });
  }
}