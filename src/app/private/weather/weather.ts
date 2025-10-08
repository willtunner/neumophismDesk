import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService } from '../../services/weather';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather.html',
  styleUrls: ['./weather.css']
})
export class Weather implements OnInit {
  weather: any;
  forecast: any[] = [];

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    const lat = -22.9099; // Campinas
    const lng = -47.0626;

    // 🔹 Busca previsão e clima atual juntos
    this.weatherService.get7DayForecast(lat, lng).subscribe((data: any) => {
      // Temperatura atual
      this.weather = {
        temperature: data.current.temperature,
        windSpeed: data.current.windspeed,
        code: data.current.weathercode
      };

      // Previsão dos próximos dias
      this.forecast = data.daily.time.map((date: string, index: number) => ({
        date,
        max: data.daily.temperature_2m_max[index],
        min: data.daily.temperature_2m_min[index],
        rain: data.daily.precipitation_sum[index],
        code: data.daily.weathercode[index]
      }));
    });
  }

  getWeatherIcon(code: number): string {
    if ([0].includes(code)) return '☀️'; // céu limpo
    if ([1, 2, 3].includes(code)) return '🌤️'; // poucas nuvens
    if ([45, 48].includes(code)) return '🌫️'; // neblina
    if ([51, 61, 63, 65, 80, 81, 82].includes(code)) return '🌧️'; // chuva
    if ([71, 73, 75, 77].includes(code)) return '❄️'; // neve
    return '☁️'; // nublado
  }
}
