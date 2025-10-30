import { Component, OnInit, signal } from '@angular/core';
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
  userLocation = signal<{lat: number | null, lng: number | null}>({lat: null, lng: null});
  locationError = signal<string | null>(null);
  isLoading = signal<boolean>(true);

  constructor(private weatherService: WeatherService) {}

  async ngOnInit(): Promise<void> {
    await this.getUserLocation();
  }

  // 🔹 Método para obter a localização do usuário
  private getUserLocation(): Promise<void> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        this.locationError.set('Geolocalização não suportada pelo navegador');
        this.useDefaultLocation();
        resolve();
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 segundos
        maximumAge: 600000 // 10 minutos
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          console.log('📍 Localização do usuário obtida:', { lat, lng });
          this.userLocation.set({ lat, lng });
          this.loadWeatherData(lat, lng);
          resolve();
        },
        (error) => {
          console.error('❌ Erro ao obter localização:', error);
          this.handleLocationError(error);
          this.useDefaultLocation();
          resolve();
        },
        options
      );
    });
  }

  // 🔹 Tratamento de erros de geolocalização
  private handleLocationError(error: GeolocationPositionError): void {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        this.locationError.set('Permissão de localização negada pelo usuário');
        break;
      case error.POSITION_UNAVAILABLE:
        this.locationError.set('Localização indisponível');
        break;
      case error.TIMEOUT:
        this.locationError.set('Tempo limite excedido ao obter localização');
        break;
      default:
        this.locationError.set('Erro desconhecido ao obter localização');
        break;
    }
  }

  // 🔹 Usar localização padrão (Campinas) como fallback
  private useDefaultLocation(): void {
    const defaultLat = -22.9099;
    const defaultLng = -47.0626;
    
    console.log('🔄 Usando localização padrão (Campinas)');
    this.userLocation.set({ lat: defaultLat, lng: defaultLng });
    this.loadWeatherData(defaultLat, defaultLng);
  }

  // 🔹 Carregar dados meteorológicos
  private loadWeatherData(lat: number, lng: number): void {
    this.isLoading.set(true);
    
    this.weatherService.get7DayForecast(lat, lng).subscribe({
      next: (data: any) => {
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

        this.isLoading.set(false);
        console.log('✅ Dados meteorológicos carregados com sucesso');
      },
      error: (error) => {
        console.error('❌ Erro ao carregar dados meteorológicos:', error);
        this.isLoading.set(false);
      }
    });
  }

  // 🔹 Método para tentar novamente a localização
  async retryLocation(): Promise<void> {
    this.isLoading.set(true);
    this.locationError.set(null);
    await this.getUserLocation();
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