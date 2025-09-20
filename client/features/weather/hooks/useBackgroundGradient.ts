import { useMemo } from 'react';
import { weatherGradients, getGradientKey } from '../../../theme/gradients';
import { CurrentWeather } from '../model/types';

interface UseBackgroundGradientProps {
  current?: CurrentWeather;
  weatherCode?: number;
  cityTimezone?: string;
  cityUtcOffset?: number;
}

export function useBackgroundGradient({ current, weatherCode, cityTimezone, cityUtcOffset }: UseBackgroundGradientProps) {
  const gradient = useMemo(() => {
    if (!current && !weatherCode) {
      return weatherGradients.default;
    }
    
    // Determine if it's day or night
    const now = Date.now() / 1000;
    const isDay = current ? 
      (now >= current.sunrise && now <= current.sunset) : 
      true; // Default to day if no sunrise/sunset data
    
    // Use weather code from current weather or provided weatherCode
    const code = current?.weatherCode || weatherCode || 0;
    
    // Enhanced gradient key with timezone support for accurate time detection
    const gradientKey = getGradientKey(code, isDay, current?.sunrise, current?.sunset, cityTimezone, cityUtcOffset);
    return weatherGradients[gradientKey] || weatherGradients.default;
  }, [current, weatherCode, cityTimezone, cityUtcOffset]);
  
  return {
    gradient,
    isDay: current ? 
      (Date.now() / 1000 >= current.sunrise && Date.now() / 1000 <= current.sunset) : 
      true
  };
}