import { Coordinates, WeatherPayload } from '../model/types';
import { fetchWeatherFromOpenMeteo } from './providers/openMeteo';

export class WeatherRepository {
  async getCurrentAndForecast(coords: Coordinates): Promise<WeatherPayload> {
    return await fetchWeatherFromOpenMeteo(coords);
  }
}