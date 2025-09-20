import { Coordinates, WeatherPayload, HourlyEntry, DailyEntry } from '../../model/types';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

function getWeatherDescription(weatherCode: number): string {
  // WMO Weather interpretation codes (WW)
  const weatherCodes: { [key: number]: string } = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  
  return weatherCodes[weatherCode] || 'Unknown';
}

// Type-safe Google geocoding helper
async function tryGoogleGeocode(coords: Coordinates): Promise<{name: string, country: string} | null> {
  try {
    // Try to import Google geocoding module (ignore TypeScript errors for optional module)
    // @ts-ignore - Optional module that may not exist
    const googleModule = await import('../../../utils/googleGeocoding').catch(() => null);
    if (googleModule && googleModule.reverseGeocode) {
      const result = await googleModule.reverseGeocode(coords);
      return { name: result.name, country: result.country };
    }
  } catch (error) {
    console.log('⚠️ Google geocoding failed or not available');
  }
  return null;
}

async function getCityName(coords: Coordinates): Promise<{name: string, country: string}> {
  try {
    // Try Google geocoding first (most reliable) if available
    const googleResult = await tryGoogleGeocode(coords);
    if (googleResult) {
      return googleResult;
    }

    // Fallback to platform-specific methods
    if (Platform.OS === 'web') {
      // Use OpenStreetMap Nominatim for reverse geocoding on web
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lon}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'WeatherApp/1.0'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        const cityName = address.city || address.town || address.village || address.municipality || address.county || 'Current Location';
        const country = address.country || '';
        return { name: cityName, country };
      }
    } else {
      // For mobile platforms, use Expo Location
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: coords.lat,
        longitude: coords.lon,
      });
      
      if (reverseGeocode.length > 0) {
        const location = reverseGeocode[0];
        const cityName = location.city || location.district || location.subregion || 'Current Location';
        const country = location.country || '';
        return { name: cityName, country };
      }
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
  }
  
  return { name: 'Current Location', country: '' };
}

// Fetch air quality data from OpenMeteo Air Quality API
async function fetchAirQualityData(coords: Coordinates): Promise<any> {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&hourly=pm10,pm2_5,dust&timezone=auto`;
  
  // Add timeout to prevent hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const res = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'WeatherApp/1.0'
      }
    });
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`Air Quality API error: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn('Air quality data not available:', error);
    return null;
  }
}

export async function fetchWeatherFromOpenMeteo(coords: Coordinates): Promise<WeatherPayload> {
  // Updated API request with precipitation_sum instead of precipitation_probability_mean
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&hourly=temperature_2m,precipitation_probability,weathercode,uv_index&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,weathercode,uv_index_max,precipitation_sum&timezone=auto`;
  
  // Add timeout to prevent hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout to 15 seconds
  
  try {
    console.log('🌦️ Fetching weather data for coordinates:', coords);
    
    const res = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'WeatherApp/1.0'
      }
    });
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`Weather API error: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    
    // Validate API response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid API response format');
    }

    // Fetch air quality data
    console.log('🌍 Fetching air quality data...');
    const airQualityData = await fetchAirQualityData(coords);
    
    // Get city name from coordinates
    const cityInfo = await getCityName(coords);

  // Defensive checks for arrays
  const hourlyTimes = Array.isArray(data?.hourly?.time) ? data.hourly.time : [];
  const hourlyTemps = Array.isArray(data?.hourly?.temperature_2m) ? data.hourly.temperature_2m : [];
  const hourlyPrecip = Array.isArray(data?.hourly?.precipitation_probability) ? data.hourly.precipitation_probability : [];
  const hourlyWeatherCodes = Array.isArray(data?.hourly?.weathercode) ? data.hourly.weathercode : [];
  const hourlyUvIndex = Array.isArray(data?.hourly?.uv_index) ? data.hourly.uv_index : [];

  const dailyTimes = Array.isArray(data?.daily?.time) ? data.daily.time : [];
  const dailyMinTemps = Array.isArray(data?.daily?.temperature_2m_min) ? data.daily.temperature_2m_min : [];
  const dailyMaxTemps = Array.isArray(data?.daily?.temperature_2m_max) ? data.daily.temperature_2m_max : [];
  const dailySunrise = Array.isArray(data?.daily?.sunrise) ? data.daily.sunrise : [];
  const dailySunset = Array.isArray(data?.daily?.sunset) ? data.daily.sunset : [];
  const dailyWeatherCodes = Array.isArray(data?.daily?.weathercode) ? data.daily.weathercode : [];
  const dailyUvIndexMax = Array.isArray(data?.daily?.uv_index_max) ? data.daily.uv_index_max : [];
  // Check if daily precipitation data is available
  const dailyPrecipitationSum = Array.isArray(data?.daily?.precipitation_sum) ? data.daily.precipitation_sum : [];

  // Air quality data
  let hourlyPm10: number[] = [];
  let hourlyPm25: number[] = [];
  let hourlyDust: number[] = [];
  
  if (airQualityData?.hourly) {
    hourlyPm10 = Array.isArray(airQualityData.hourly.pm10) ? airQualityData.hourly.pm10 : [];
    hourlyPm25 = Array.isArray(airQualityData.hourly.pm2_5) ? airQualityData.hourly.pm2_5 : [];
    hourlyDust = Array.isArray(airQualityData.hourly.dust) ? airQualityData.hourly.dust : [];
  }

  // Map hourly data
  const hourly: HourlyEntry[] = hourlyTimes.map((time: string, i: number) => {
    const entry = {
      time: Math.floor(new Date(time).getTime() / 1000),
      tempC: hourlyTemps[i] ?? 0,
      precipProb: hourlyPrecip[i] ?? 0,
      weatherCode: hourlyWeatherCodes[i] ?? 0,
      uvIndex: hourlyUvIndex[i] ?? 0,
      pm10: hourlyPm10[i] ?? 0,
      pm25: hourlyPm25[i] ?? 0,
      dust: hourlyDust[i] ?? 0,
    };
    return entry;
  });
  
  console.log('🔍 Mapped hourly data length:', hourly.length);
  console.log('🔍 Sample mapped UV index values:', hourly.slice(6, 12).map(h => h.uvIndex));

  // Map daily data
  const daily: DailyEntry[] = dailyTimes.map((date: string, i: number) => ({
    date: Math.floor(new Date(date).getTime() / 1000),
    tempMinC: dailyMinTemps[i] ?? 0,
    tempMaxC: dailyMaxTemps[i] ?? 0,
    sunrise: dailySunrise[i] ? Math.floor(new Date(dailySunrise[i]).getTime() / 1000) : 0,
    sunset: dailySunset[i] ? Math.floor(new Date(dailySunset[i]).getTime() / 1000) : 0,
    weatherCode: dailyWeatherCodes[i] ?? 0,
    uvIndexMax: dailyUvIndexMax[i] ?? 0,
    // Using precipitation_sum instead of precipitation_probability_mean
    precipitationSum: dailyPrecipitationSum[i] ?? 0,
  }));

  // Type guard for daily[0]
  const firstDay = daily.length > 0 ? daily[0] : undefined;
  const sunrise = firstDay?.sunrise ?? 0;
  const sunset = firstDay?.sunset ?? 0;

  // Use the daily maximum UV index as the current UV index
  // This is more useful for users as it shows the expected maximum UV for the day
  let currentUvIndex: number | undefined = undefined;
  if (firstDay?.uvIndexMax !== undefined && firstDay.uvIndexMax > 0) {
    currentUvIndex = firstDay.uvIndexMax;
  } else {
    // Fallback to finding current hourly UV index based on current time
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    
    // Find the closest hourly entry to current time
    let minTimeDiff = Infinity;
    let closestEntry: HourlyEntry | null = null;
    
    for (let i = 0; i < hourly.length; i++) {
      const entry = hourly[i];
      const timeDiff = Math.abs(entry.time - now);
      
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        closestEntry = entry;
      }
    }
    
    // Use the closest entry's UV index if found
    if (closestEntry) {
      currentUvIndex = closestEntry.uvIndex;
    }
    
    // Fallback to first entry if no close match found
    if (currentUvIndex === undefined && hourly.length > 0) {
      currentUvIndex = hourly[0].uvIndex;
    }
  }
  
  console.log('🔍 Final currentUvIndex value:', currentUvIndex);

    // Create the weather payload
    const weatherPayload: WeatherPayload = {
      city: {
        name: cityInfo.name,
        country: cityInfo.country,
        lat: coords.lat,
        lon: coords.lon,
        timezone: data?.timezone, // IANA timezone name
        utcOffset: data?.utc_offset_seconds, // UTC offset in seconds
      },
      current: {
        // Original CurrentWeather fields
        tempC: data?.current_weather?.temperature ?? 0,
        feelsLikeC: data?.current_weather?.temperature ?? 0,
        weatherDescription: getWeatherDescription(data?.current_weather?.weathercode ?? 0),
        weatherCode: data?.current_weather?.weathercode ?? 0,
        humidity: 50, // Not provided by Open-Meteo
        windSpeedKmh: data?.current_weather?.windspeed ?? 0,
        sunrise,
        sunset,
        // New fields for UV index and air quality
        uvIndex: currentUvIndex, // Use properly calculated current UV index
        pm10: hourlyPm10[0] ?? 0,
        pm25: hourlyPm25[0] ?? 0,
        dust: hourlyDust[0] ?? 0,
        // New fields for AI weather summary
        temperature_2m: data?.current_weather?.temperature ?? 0,
        apparent_temperature: data?.current_weather?.temperature ?? 0,
        relative_humidity_2m: 50, // Not provided by Open-Meteo
        wind_speed_10m: data?.current_weather?.windspeed ?? 0,
        weather_code: data?.current_weather?.weathercode ?? 0,
        uv_index: currentUvIndex, // Also populate for AI summary
      },
      
      hourly: hourly.map(entry => ({
        ...entry,
        // The hourly entry already matches the HourlyEntry type
      })),
      daily: daily.map((entry, i) => ({
        ...entry,
        // Add new fields for AI weather summary
        temperature_2m_max: entry.tempMaxC,
        temperature_2m_min: entry.tempMinC,
      })),
      units: {
        temperature_2m: '°C',
        wind_speed_10m: 'km/h',
      },
      lastUpdated: Math.floor(Date.now() / 1000), // Current timestamp
    };
    
    console.log('=== Weather Payload Debug ===');
    console.log('Current UV Index in payload:', weatherPayload.current.uvIndex);
    console.log('Current UV Index (alt) in payload:', weatherPayload.current.uv_index);

    console.log('✅ Weather data processing completed successfully');
    return weatherPayload;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Enhanced error logging
    console.error('❌ Weather API error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      coords,
      url,
      timestamp: new Date().toISOString()
    });
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Weather request timed out. Please check your internet connection.');
      }
      if (error.message.includes('API error: 429')) {
        throw new Error('Weather service rate limit exceeded. Please try again later.');
      }
      if (error.message.includes('API error: 503')) {
        throw new Error('Weather service temporarily unavailable. Please try again later.');
      }
    }
    
    throw new Error('Failed to fetch weather data. Please check your internet connection and try again.');
  }
}