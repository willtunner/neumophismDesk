import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private openMeteoBaseUrl = 'https://api.open-meteo.com/v1/forecast';
  private stormglassBaseUrl = 'https://api.stormglass.io/v2/weather/point';
  private apiKey = 'bd56243c-a468-11f0-8208-0242ac130006-bd5624a0-a468-11f0-8208-0242ac130006';

  constructor(private http: HttpClient) {}

  /**
   * 🌊 Clima atual (temperatura, vento, umidade etc.)
   * StormGlass — dados instantâneos
   */
  getCurrentWeather(lat: number, lng: number, params: string = 'airTemperature,windSpeed,humidity'): Observable<any> {
    const headers = new HttpHeaders({ 'Authorization': this.apiKey });
    const url = `${this.stormglassBaseUrl}?lat=${lat}&lng=${lng}&params=${params}`;

    return this.http.get(url, { headers }).pipe(
      catchError(error => {
        console.error('Erro ao buscar clima atual (StormGlass):', error);
        return throwError(() => new Error('Erro ao buscar clima atual.'));
      })
    );
  }

  /**
   * ☀️ Previsão de 7 dias + temperatura atual
   * Open-Meteo — gratuita e sem chave
   */
  get7DayForecast(lat: number, lng: number): Observable<any> {
    const url =
      `${this.openMeteoBaseUrl}?latitude=${lat}&longitude=${lng}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode` +
      `&current_weather=true&timezone=America/Sao_Paulo`;

    return this.http.get(url).pipe(
      map((data: any) => ({
        current: data.current_weather,
        daily: data.daily
      })),
      catchError(error => {
        console.error('Erro ao buscar previsão de 7 dias:', error);
        return throwError(() => new Error('Erro ao buscar previsão de 7 dias.'));
      })
    );
  }

  /**
   * 🏙️ Previsão e clima atual para Campinas
   */
  getCampinasForecast(): Observable<any> {
    const lat = -22.9056;
    const lng = -47.0608;
    return this.get7DayForecast(lat, lng);
  }
}
