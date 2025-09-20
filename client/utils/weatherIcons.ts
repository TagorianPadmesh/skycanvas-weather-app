// Weather icon mapping based on Open-Meteo weather codes
// https://open-meteo.com/en/docs#weather-variables

// Weather icon mapping with fallbacks for better compatibility
const WEATHER_ICONS = {
  // Clear sky
  clear_day: '☀️',
  clear_night: '🌙',
  
  // Clouds
  partly_cloudy_day: '⛅',
  partly_cloudy_night: '☁️',
  cloudy: '☁️',
  overcast: '☁️',
  
  // Precipitation
  fog: '🌫️',
  drizzle: '💧', // Using water droplet instead of complex emoji
  light_rain: '💧',
  rain: '☔', // Using umbrella emoji as fallback
  heavy_rain: '☔',
  snow: '❄️',
  snow_light: '❄️',
  thunderstorm: '⚡', // Using lightning bolt as simpler alternative
  
  // Fallbacks
  default_day: '☀️',
  default_night: '🌙'
};

export function getWeatherIcon(weatherCode: number, isDay?: boolean): string {
  const isDayTime = isDay !== undefined ? isDay : true;

  console.log('🌤️ Weather Icon Debug - Code:', weatherCode, 'isDay:', isDayTime);

  let iconKey: string;

  switch (weatherCode) {
    // Clear sky
    case 0:
      iconKey = isDayTime ? 'clear_day' : 'clear_night';
      break;
    
    // Mainly clear, partly cloudy, and overcast
    case 1: // Mainly clear
      iconKey = isDayTime ? 'clear_day' : 'clear_night';
      break;
    case 2: // Partly cloudy
      iconKey = isDayTime ? 'partly_cloudy_day' : 'partly_cloudy_night';
      break;
    case 3: // Overcast
      iconKey = 'overcast';
      break;
    
    // Fog and depositing rime fog
    case 45:
    case 48:
      iconKey = 'fog';
      break;
    
    // Drizzle: Light, moderate, and dense intensity
    case 51:
    case 53:
    case 55:
      iconKey = 'drizzle';
      break;
    
    // Freezing Drizzle: Light and dense intensity
    case 56:
    case 57:
      iconKey = 'light_rain';
      break;
    
    // Rain: Slight, moderate and heavy intensity
    case 61: // Slight rain
      iconKey = 'light_rain';
      break;
    case 63: // Moderate rain
      iconKey = 'rain';
      break;
    case 65: // Heavy rain
      iconKey = 'heavy_rain';
      break;
    
    // Freezing Rain: Light and heavy intensity
    case 66:
    case 67:
      iconKey = 'rain';
      break;
    
    // Snow fall: Slight, moderate, and heavy intensity
    case 71:
    case 77:
      iconKey = 'snow_light';
      break;
    case 73:
    case 75:
      iconKey = 'snow';
      break;
    
    // Rain showers: Slight, moderate, and violent
    case 80:
      iconKey = 'light_rain';
      break;
    case 81:
    case 82:
      iconKey = 'rain';
      break;
    
    // Snow showers slight and heavy
    case 85:
      iconKey = 'snow_light';
      break;
    case 86:
      iconKey = 'snow';
      break;
    
    // Thunderstorm: Slight or moderate and with slight and heavy hail
    case 95:
    case 96:
    case 99:
      iconKey = 'thunderstorm';
      break;
    
    // Default fallback
    default:
      iconKey = isDayTime ? 'default_day' : 'default_night';
      break;
  }

  const icon = WEATHER_ICONS[iconKey as keyof typeof WEATHER_ICONS] || WEATHER_ICONS.default_day;
  console.log(`🌤️ Weather code ${weatherCode} -> ${iconKey} -> ${icon}`);
  return icon;
}

// Helper function to determine if it's day time based on current time and sunrise/sunset
export function isDayTime(currentTime: number, sunrise?: number, sunset?: number): boolean {
  if (!sunrise || !sunset) {
    // Fallback to basic time check (6 AM to 6 PM)
    const hour = new Date(currentTime * 1000).getHours();
    return hour >= 6 && hour < 18;
  }
  
  return currentTime >= sunrise && currentTime <= sunset;
}

// Enhanced version that considers time of day for more accurate icons
export function getWeatherIconWithTime(
  weatherCode: number, 
  currentTime?: number, 
  sunrise?: number, 
  sunset?: number
): string {
  const isDay = currentTime ? isDayTime(currentTime, sunrise, sunset) : true;
  return getWeatherIcon(weatherCode, isDay);
}

// Test function to verify weather icons work correctly
export function testWeatherIcons() {
  console.log('🧪 Testing weather icons:');
  const testCases = [
    { code: 0, name: 'Clear sky' },
    { code: 1, name: 'Mainly clear' },
    { code: 2, name: 'Partly cloudy' },
    { code: 3, name: 'Overcast' },
    { code: 45, name: 'Fog' },
    { code: 51, name: 'Light drizzle' },
    { code: 61, name: 'Slight rain' },
    { code: 63, name: 'Moderate rain' },
    { code: 71, name: 'Slight snow' },
    { code: 73, name: 'Moderate snow' },
    { code: 95, name: 'Thunderstorm' }
  ];
  
  testCases.forEach(({ code, name }) => {
    const dayIcon = getWeatherIcon(code, true);
    const nightIcon = getWeatherIcon(code, false);
    console.log(`${code}: ${name} - Day: ${dayIcon}, Night: ${nightIcon}`);
  });
}

// Make test function globally available
if (typeof window !== 'undefined') {
  (window as any).testWeatherIcons = testWeatherIcons;
}