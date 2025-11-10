import { Injectable, isDevMode } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private apiKey = '026fbb7f2981493ebfe52849126572cb';

  private baseUrl = 'https://newsapi.org/v2/everything';
  private corsProxy = 'https://cors-anywhere.herokuapp.com/';

  constructor(private http: HttpClient) {}

  getNews(q: string, from: string): Observable<any> {
    const url = isDevMode()
      ? this.corsProxy + this.baseUrl // em dev usa o proxy CORS
      : this.baseUrl; // em produção vai direto (se tiver backend próprio)

    const params = new HttpParams()
      .set('q', q)
      .set('from', from)
      .set('language', 'pt')
      .set('sortBy', 'publishedAt')
      .set('apiKey', this.apiKey);

    console.log('📡 Requisição para:', `${url}?${params.toString()}`);

    return this.http.get(url, { params });
  }
}
