import { useQuery } from '@tanstack/react-query';
import { Coordinates, WeatherPayload } from '../model/types';
import { WeatherRepository } from '../api/weatherRepository';

const repo = new WeatherRepository();

export function useWeather(coords: Coordinates) {
  return useQuery<WeatherPayload>({
    queryKey: ['weather', coords.lat, coords.lon],
    queryFn: () => repo.getCurrentAndForecast(coords),
    staleTime: 10 * 60 * 1000, // 10 minutes - cache aggressively
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    retry: 1, // Only 1 retry for speed
    retryDelay: 500, // 0.5 second between retries
    enabled: coords.lat !== 0 || coords.lon !== 0,
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnReconnect: false, // Don't refetch on reconnect
  });
}