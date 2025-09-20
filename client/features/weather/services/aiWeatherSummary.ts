import { WeatherPayload } from '../model/types';

// Interface for AI provider
export interface AIProvider {
  generateWeatherSummary(weatherData: WeatherPayload): Promise<string>;
}

// OpenAI Implementation
export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o-mini') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateWeatherSummary(weatherData: WeatherPayload): Promise<string> {
    console.log('=== OpenAIProvider Debug ===');
    console.log('OpenAIProvider: generateWeatherSummary called');
    
    // Check if API key is valid
    if (!this.apiKey) {
      throw new Error('OpenAI API key is missing');
    }
    
    // Check if API key looks like a substitution failure
    if (this.apiKey.startsWith('${')) {
      throw new Error(`OpenAI API key substitution failed. Key value: ${this.apiKey}`);
    }
    
    console.log('OpenAIProvider: API Key length:', this.apiKey.length);
    console.log('OpenAIProvider: First 10 characters of API Key:', this.apiKey.substring(0, 10));
    
    const prompt = this.createWeatherPrompt(weatherData);
    console.log('OpenAIProvider: Prompt created:', prompt);
    
    try {
      console.log('OpenAIProvider: Making API request to OpenAI');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a friendly, concise weather reporter for a mobile weather app. Create a single, natural-sounding sentence that a weather reporter might say. Focus on the most important information. Keep it friendly and engaging. Do not mention specific numbers unless they are particularly noteworthy. Maximum 20 words.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 100,
          temperature: 0.7
        })
      });

      console.log('OpenAIProvider: API response received');
      console.log('OpenAIProvider: Response status:', response.status);
      console.log('OpenAIProvider: Response ok:', response.ok);
      
      const data = await response.json();
      console.log('OpenAIProvider: API response data:', JSON.stringify(data, null, 2));
      
      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 429) {
          console.log('OpenAI API quota exceeded, using fallback summary');
          return this.getFallbackSummary(weatherData);
        }
        if (response.status === 401) {
          console.log('OpenAI API authentication failed, using fallback summary');
          return this.getFallbackSummary(weatherData);
        }
        throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(data)}`);
      }
      
      const summary = data.choices[0].message.content.trim();
      console.log('OpenAIProvider: Generated summary:', summary);
      return summary;
    } catch (error: any) {
      console.error('Error generating weather summary with OpenAI:', error);
      // Always return fallback summary instead of throwing error
      return this.getFallbackSummary(weatherData);
    }
  }

  private createWeatherPrompt(weatherData: WeatherPayload): string {
    const current = weatherData.current;
    const daily = weatherData.daily[0]; // Today's forecast
    
    return this.createWeatherContext(current, daily, weatherData);
  }

  private createWeatherContext(current: any, daily: any, weatherData: WeatherPayload): string {
    let airQualityInfo = '';
    if (current.uv_index !== undefined || current.pm2_5 !== undefined || current.pm10 !== undefined) {
      airQualityInfo = '\nAir Quality Information:\n';
      if (current.uv_index !== undefined && current.uv_index > 0) {
        airQualityInfo += `UV Index: ${current.uv_index.toFixed(1)}\n`;
      }
      if (current.pm2_5 !== undefined) {
        airQualityInfo += `PM2.5: ${current.pm2_5.toFixed(1)} μg/m³\n`;
      }
      if (current.pm10 !== undefined) {
        airQualityInfo += `PM10: ${current.pm10.toFixed(1)} μg/m³\n`;
      }
    }
    
    // Create a more detailed and engaging prompt
    return `You are a friendly weather reporter for a mobile weather app. Create a concise, natural-sounding weather summary for these conditions:

Current Weather:
Temperature: ${current.temperature_2m}${weatherData.units.temperature_2m}
Condition: ${this.getWeatherDescription(current.weather_code)}
Feels like: ${current.apparent_temperature}${weatherData.units.temperature_2m}
Humidity: ${current.relative_humidity_2m}%
Wind: ${current.wind_speed_10m} ${weatherData.units.wind_speed_10m}${airQualityInfo}

Today's Forecast:
High: ${daily.temperature_2m_max}${weatherData.units.temperature_2m}
Low: ${daily.temperature_2m_min}${weatherData.units.temperature_2m}
Precipitation: ${daily.precipitationSum !== undefined ? daily.precipitationSum.toFixed(1) + 'mm' : 'N/A'}

Provide a single, conversational sentence that a weather reporter might say on TV or radio. Focus on the most important information. Keep it friendly and engaging. Do not mention specific numbers unless they're particularly noteworthy. Maximum 20 words.`;
  }

  private getWeatherDescription(weatherCode: number): string {
    const weatherDescriptions: Record<number, string> = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
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
    
    return weatherDescriptions[weatherCode] || 'Unknown weather condition';
  }

  private getFallbackSummary(weatherData: WeatherPayload): string {
    const current = weatherData.current;
    const daily = weatherData.daily[0];
    
    // Create a more engaging fallback summary
    const weatherDesc = this.getWeatherDescription(current.weather_code);
    const temp = current.temperature_2m;
    const unit = weatherData.units.temperature_2m;
    const high = daily.temperature_2m_max;
    const low = daily.temperature_2m_min;
    const precip = daily.precipitationSum ?? 0;
    
    // Generate different summaries based on conditions
    if (precip > 10) {
      return `Expect ${weatherDesc.toLowerCase()} today with a high of ${high}${unit}. Don't forget your umbrella!`;
    } else if (temp > 30) {
      return `It's a warm ${weatherDesc.toLowerCase()} day reaching ${high}${unit}. Stay hydrated!`;
    } else if (temp < 5) {
      return `Brrr! It's ${weatherDesc.toLowerCase()} and cold at ${temp}${unit}. Dress warmly!`;
    } else if (Math.abs(high - low) > 10) {
      return `Expect ${weatherDesc.toLowerCase()} conditions with temperatures ranging from ${low}${unit} to ${high}${unit}.`;
    } else {
      return `Currently ${temp}${unit} and ${weatherDesc.toLowerCase()} with a high of ${high}${unit} today.`;
    }
  }

}

// Factory function to create the OpenAI provider
export function createAIProvider(apiKey: string): OpenAIProvider {
  console.log('createAIProvider called with API key length:', apiKey?.length || 0);
  return new OpenAIProvider(apiKey);
}