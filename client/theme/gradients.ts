// Dynamic background gradients based on weather conditions and time of day
export const weatherGradients: Record<string, string[]> = {
  // Clear skies - Different times of day
  clear_dawn: ['#FF6B6B', '#FFE66D', '#87CEEB', '#6BB6FF'], // Warm orange to blue dawn
  clear_day: ['#87CEEB', '#6BB6FF', '#4A90E2', '#74C7EC'], // Perfect bright sky blue progression
  clear_evening: ['#FF8E53', '#FF6B9D', '#9B59B6', '#2E4B7C'], // Warm orange/pink to purple evening
  clear_night: ['#0B1426', '#1B2951', '#2E4B7C', '#2A3A5C'], // Deep mystical night sky with lighter bottom
  
  // Partly cloudy - Different times of day
  partly_cloudy_dawn: ['#FFB366', '#FFA726', '#87CEEB', '#6BB6FF'], // Golden dawn with clouds
  partly_cloudy_day: ['#74b9ff', '#6BB6FF', '#4A90E2', '#87CEEB'], // Bright vibrant blue with subtle clouds
  partly_cloudy_evening: ['#FF7043', '#8E24AA', '#5E35B1', '#3F51B5'], // Warm evening with purple clouds
  partly_cloudy_night: ['#2d3436', '#74b9ff', '#4A5568'], // Night blue with lighter purple
  
  // Cloudy - Different times of day
  cloudy_dawn: ['#FFB366', '#E1A95F', '#B0C4DE', '#87CEEB'], // Golden cloudy dawn
  cloudy_day: ['#B0C4DE', '#87CEEB', '#778899'], // Light gray-blue
  cloudy_evening: ['#E1A95F', '#CD853F', '#778899', '#708090'], // Warm cloudy evening
  cloudy_night: ['#2F2F2F', '#4A4A4A', '#3A3A3A'], // Dark cloudy night with lighter bottom
  
  // Overcast - Different times of day
  overcast_dawn: ['#D2691E', '#B0C4DE', '#87CEEB'], // Dawn overcast
  overcast_day: ['#87CEEB', '#778899', '#708090'], // Overcast day
  overcast_evening: ['#CD853F', '#A0522D', '#708090'], // Evening overcast
  overcast_night: ['#1C1C1C', '#2F2F2F', '#2A2A2A'], // Dark overcast night with lighter bottom
  
  // Rain - Different times of day
  light_rain_dawn: ['#FFB366', '#74b9ff', '#4682B4', '#2F4F4F'], // Dawn light rain
  light_rain_day: ['#74b9ff', '#4682B4', '#2F4F4F'], // Light rain day
  light_rain_evening: ['#FF8C69', '#4682B4', '#2F4F4F'], // Evening light rain
  light_rain_night: ['#1a1a2e', '#2F4F4F', '#2A3F4F'], // Light rain night with lighter bottom
  
  rain_dawn: ['#E1A95F', '#4682B4', '#2F4F4F', '#708090'], // Dawn rain
  rain_day: ['#4682B4', '#2F4F4F', '#708090'], // Rain day
  rain_evening: ['#CD853F', '#4682B4', '#2F4F4F'], // Evening rain
  rain_night: ['#0F0F23', '#1a1a2e', '#1A1A3A'], // Rain night with lighter bottom
  
  heavy_rain_dawn: ['#D2691E', '#2F4F4F', '#4682B4'], // Dawn heavy rain
  heavy_rain_day: ['#2F4F4F', '#4682B4', '#74b9ff'], // Heavy rain day
  heavy_rain_evening: ['#A0522D', '#2F4F4F', '#4682B4'], // Evening heavy rain
  heavy_rain_night: ['#0A0A0A', '#1a1a2e', '#1A1A2A'], // Heavy rain night with lighter bottom
  
  // Thunderstorm - Different times of day
  thunderstorm_dawn: ['#8B4513', '#2F4F4F', '#4682B4'], // Dawn storm
  thunderstorm_day: ['#2F4F4F', '#4682B4', '#87CEEB'], // Storm day
  thunderstorm_evening: ['#654321', '#2F4F4F', '#4682B4'], // Evening storm
  thunderstorm_night: ['#000000', '#0F0F23', '#1A1A2E'], // Storm night with lighter bottom
  
  // Snow - Different times of day
  snow_dawn: ['#FFE4E1', '#F0F8FF', '#E6E6FA'], // Dawn snow
  snow_day: ['#F0F8FF', '#E6E6FA', '#B0C4DE'], // Snow day
  snow_evening: ['#F5DEB3', '#F0F8FF', '#E6E6FA'], // Evening snow
  snow_night: ['#2F2F4F', '#4A4A6A', '#3A3A5A'], // Snow night with lighter bottom
  
  // Fog/Mist - Different times of day
  fog_dawn: ['#FFDAB9', '#F5F5F5', '#E0E0E0'], // Dawn fog
  fog_day: ['#F5F5F5', '#E0E0E0', '#D3D3D3'], // Foggy day
  fog_evening: ['#F5DEB3', '#F5F5F5', '#E0E0E0'], // Evening fog
  fog_night: ['#2A2A2A', '#3A3A3A', '#2F2F2F'], // Foggy night with lighter bottom
  
  mist_dawn: ['#FFE4E1', '#F8F8FF', '#E6E6FA'], // Dawn mist
  mist_day: ['#F8F8FF', '#E6E6FA', '#D3D3D3'], // Misty day
  mist_evening: ['#F5DEB3', '#F8F8FF', '#E6E6FA'], // Evening mist
  mist_night: ['#2F2F3F', '#4F4F5F', '#2A2A3A'], // Misty night with lighter bottom
  
  // Default - Different times of day
  default_dawn: ['#FF6B6B', '#FFE66D', '#87CEEB', '#6BB6FF'], // Dawn default
  default_day: ['#87CEEB', '#6BB6FF', '#4A90E2', '#74C7EC'], // Perfect bright sky blue
  default_evening: ['#FF8E53', '#FF6B9D', '#9B59B6', '#2E4B7C'], // Evening default
  default_night: ['#0B1426', '#1B2951', '#2E4B7C', '#2A3A5C'], // Deep mystical night with lighter bottom
  default: ['#87CEEB', '#6BB6FF', '#4A90E2', '#74C7EC'], // Vibrant fallback
};

// Weather code mapping (Open-Meteo codes to gradient keys)
export const weatherCodeToGradient: Record<number, string> = {
  // Clear sky
  0: 'clear',
  
  // Mainly clear, partly cloudy, and overcast
  1: 'partly_cloudy',
  2: 'partly_cloudy', 
  3: 'overcast',
  
  // Fog and depositing rime fog
  45: 'fog',
  48: 'fog',
  
  // Drizzle
  51: 'light_rain',
  53: 'light_rain',
  55: 'rain',
  
  // Freezing Drizzle
  56: 'rain',
  57: 'rain',
  
  // Rain
  61: 'light_rain',
  63: 'rain',
  65: 'heavy_rain',
  
  // Freezing Rain
  66: 'rain',
  67: 'rain',
  
  // Snow fall
  71: 'snow',
  73: 'snow',
  75: 'snow',
  77: 'snow',
  
  // Rain showers
  80: 'rain',
  81: 'rain',
  82: 'heavy_rain',
  
  // Snow showers
  85: 'snow',
  86: 'snow',
  
  // Thunderstorm
  95: 'thunderstorm',
  96: 'thunderstorm',
  99: 'thunderstorm',
};

export function getGradientKey(
  weatherCode: number, 
  isDay: boolean, 
  sunrise?: number, 
  sunset?: number,
  cityTimezone?: string,
  cityUtcOffset?: number
): string {
  const baseKey = weatherCodeToGradient[weatherCode] || 'default';
  
  // Enhanced time detection for dawn/day/evening/night using city timezone
  const timeOfDay = getTimeOfDay(isDay, sunrise, sunset, cityTimezone, cityUtcOffset);
  const timeBasedKey = `${baseKey}_${timeOfDay}`;
  
  // Check if the time-specific gradient exists
  if (weatherGradients[timeBasedKey]) {
    return timeBasedKey;
  }
  
  // Fallback to day/night if time-specific doesn't exist
  const dayNightKey = isDay ? `${baseKey}_day` : `${baseKey}_night`;
  if (weatherGradients[dayNightKey]) {
    return dayNightKey;
  }
  
  // Fallback to base key if day/night variant doesn't exist
  if (weatherGradients[baseKey]) {
    return baseKey;
  }
  
  // Final fallback
  return isDay ? 'default_day' : 'default_night';
}

// Helper function to determine time of day based on sunrise/sunset with timezone support
function getTimeOfDay(
  isDay: boolean, 
  sunrise?: number, 
  sunset?: number,
  cityTimezone?: string,
  cityUtcOffset?: number
): string {
  if (!sunrise || !sunset) {
    return isDay ? 'day' : 'night';
  }
  
  // Get current time in the city's timezone
  const getCityCurrentTime = (): Date => {
    if (cityTimezone) {
      try {
        const now = new Date();
        // Use Intl.DateTimeFormat for accurate timezone conversion
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: cityTimezone,
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: false
        });
        const parts = formatter.formatToParts(now);
        const dateObj: Record<string, string> = {};
        parts.forEach(part => {
          if (part.type !== 'literal') {
            dateObj[part.type] = part.value;
          }
        });
        return new Date(
          parseInt(dateObj.year),
          parseInt(dateObj.month) - 1, // Month is 0-indexed in JS Date
          parseInt(dateObj.day),
          parseInt(dateObj.hour),
          parseInt(dateObj.minute),
          parseInt(dateObj.second)
        );
      } catch (error) {
        console.warn('Invalid timezone in getTimeOfDay, falling back to UTC offset:', cityTimezone, error);
      }
    }
    
    if (cityUtcOffset !== undefined) {
      const now = new Date();
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const cityTime = new Date(utcTime - (cityUtcOffset * 1000));
      return cityTime;
    }
    
    return new Date(); // Fallback to local time
  };
  
  const cityTime = getCityCurrentTime();
  const currentHour = cityTime.getHours();
  const currentMinutes = cityTime.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinutes;
  
  // Convert sunrise/sunset times to city timezone
  // Note: OpenMeteo API already returns sunrise/sunset in local timezone, so we just need to parse them
  const sunriseDate = new Date(sunrise * 1000);
  const sunsetDate = new Date(sunset * 1000);
  
  const sunriseMinutes = sunriseDate.getHours() * 60 + sunriseDate.getMinutes();
  const sunsetMinutes = sunsetDate.getHours() * 60 + sunsetDate.getMinutes();
  
  // Dawn: 1 hour before sunrise to 1 hour after sunrise
  const dawnStart = sunriseMinutes - 60;
  const dawnEnd = sunriseMinutes + 60;
  
  // Evening: 1 hour before sunset to 1 hour after sunset
  const eveningStart = sunsetMinutes - 60;
  const eveningEnd = sunsetMinutes + 60;
  
  if (currentTimeInMinutes >= dawnStart && currentTimeInMinutes <= dawnEnd) {
    return 'dawn';
  } else if (currentTimeInMinutes >= eveningStart && currentTimeInMinutes <= eveningEnd) {
    return 'evening';
  } else if (currentTimeInMinutes > dawnEnd && currentTimeInMinutes < eveningStart) {
    return 'day';
  } else {
    return 'night';
  }
}