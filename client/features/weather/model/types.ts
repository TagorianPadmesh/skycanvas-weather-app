export type Coordinates = {
  lat: number;
  lon: number;
};

export type City = {
  name: string;
  country: string;
  lat: number;
  lon: number;
  timezone?: string; // IANA timezone name (e.g., "America/New_York")
  utcOffset?: number; // UTC offset in seconds
};

export type CurrentWeather = {
  tempC: number;
  feelsLikeC: number;
  weatherDescription: string;
  weatherCode: number; // Weather condition code
  humidity: number;
  windSpeedKmh: number;
  sunrise: number;
  sunset: number;
  // New fields for UV index and air quality
  uvIndex?: number;
  pm10?: number;
  pm25?: number;
  dust?: number;
};

export type HourlyEntry = {
  time: number; // Unix timestamp (seconds)
  tempC: number;
  precipProb?: number;
  weatherCode?: number; // Weather condition code for this hour
  // New fields for UV index and air quality
  uvIndex?: number;
  pm10?: number;
  pm25?: number;
  dust?: number;
};

export type DailyEntry = {
  date: number; // Unix timestamp (seconds)
  tempMinC: number;
  tempMaxC: number;
  sunrise: number;
  sunset: number;
  weatherCode?: number; // Weather condition code for this day
  // New field for UV index
  uvIndexMax?: number;
  // New field for precipitation sum
  precipitationSum?: number;
};

export type WeatherUnits = {
  temperature_2m: string;
  wind_speed_10m: string;
  // Add other units as needed
};

export type WeatherPayload = {
  city: City;
  current: CurrentWeather & {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    // New fields for UV index and air quality
    uv_index?: number;
    pm10?: number;
    pm2_5?: number;
    dust?: number;
  };
  hourly: HourlyEntry[];
  daily: (DailyEntry & {
    temperature_2m_max: number;
    temperature_2m_min: number;
    // No additional fields needed for AI weather summary since we're using precipitationSum directly
  })[];
  units: WeatherUnits;
  lastUpdated?: number; // Timestamp of last update
};