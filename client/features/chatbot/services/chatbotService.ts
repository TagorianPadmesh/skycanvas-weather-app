import { WeatherPayload } from '../../weather/model/types';

// Hugging Face Inference API for open-source models
const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export class ChatbotService {
  private apiKey: string;

  constructor() {
    // Using Hugging Face's free inference API - no API key required for basic usage
    this.apiKey = ''; // Not required for basic models
  }

  async getWeatherResponse(userMessage: string, weatherData: WeatherPayload): Promise<string> {
    try {
      // For now, we'll use a rule-based approach since Hugging Face free tier has limitations
      // In a production app, you would use the actual API
      const response = this.generateRuleBasedResponse(userMessage, weatherData);
      
      return response;
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
    }
  }

  private createWeatherContextPrompt(userMessage: string, weatherData: WeatherPayload): string {
    const current = weatherData.current;
    const daily = weatherData.daily && weatherData.daily.length > 0 ? weatherData.daily[0] : null;
    
    if (!daily) {
      return `You are a helpful weather assistant. The user has asked: "${userMessage}"
      
Current weather context is not available.`;
    }
    
    // Build air quality information string
    let airQualityInfo = '';
    if (current.uv_index !== undefined || current.pm2_5 !== undefined) {
      airQualityInfo = '\nAir Quality Information:\n';
      if (current.uv_index !== undefined && current.uv_index > 0) {
        airQualityInfo += `- UV Index: ${current.uv_index.toFixed(1)}\n`;
      }
      if (current.pm2_5 !== undefined) {
        airQualityInfo += `- PM2.5: ${current.pm2_5.toFixed(1)} μg/m³\n`;
      }
      if (current.pm10 !== undefined) {
        airQualityInfo += `- PM10: ${current.pm10.toFixed(1)} μg/m³\n`;
      }
    }
    
    return `You are a helpful weather assistant. The user has asked: "${userMessage}"
    
Current weather context:
- Location: ${weatherData.city?.name || 'Unknown'}, ${weatherData.city?.country || 'Unknown'}
- Temperature: ${current.temperature_2m}${weatherData.units?.temperature_2m || '°C'}
- Condition: ${this.getWeatherDescription(current.weather_code)}
- Feels like: ${current.apparent_temperature}${weatherData.units?.temperature_2m || '°C'}
- Humidity: ${current.relative_humidity_2m || 'N/A'}%
- Wind: ${current.wind_speed_10m || 'N/A'} ${weatherData.units?.wind_speed_10m || 'km/h'}${airQualityInfo}
- Today's High: ${daily.temperature_2m_max}${weatherData.units?.temperature_2m || '°C'}
- Today's Low: ${daily.temperature_2m_min}${weatherData.units?.temperature_2m || '°C'}
- Precipitation: ${daily.precipitationSum !== undefined ? daily.precipitationSum.toFixed(1) + 'mm' : 'N/A'}

Please provide a helpful, concise response to the user's question using this context.`;
  }

  private generateRuleBasedResponse(userMessage: string, weatherData: WeatherPayload): string {
    // Check if we have the required data
    if (!weatherData.current || !weatherData.daily || weatherData.daily.length === 0) {
      return "I'm sorry, I don't have complete weather data to answer your question right now.";
    }
    
    const message = userMessage.toLowerCase();
    const current = weatherData.current;
    const daily = weatherData.daily[0];
    
    // Generate responses based on specific keywords in the question
    const responses: string[] = [];
    
    // UV Index questions
    if (message.includes('uv') || message.includes('sunscreen') || message.includes('sun protection') || 
        message.includes('burn') || message.includes('ultraviolet')) {
      
      // Check if UV index is available and greater than 0
      if (current.uv_index !== undefined && current.uv_index > 0) {
        const uvIndex = current.uv_index;
        if (uvIndex >= 8) {
          responses.push(`UV levels are extremely high at ${uvIndex.toFixed(1)}. Take all precautions: wear sunscreen (SPF 30+), a hat, sunglasses, and try to stay in shade.`);
        } else if (uvIndex >= 6) {
          responses.push(`UV levels are high at ${uvIndex.toFixed(1)}. Wear sunscreen (SPF 30+), a hat, and sunglasses. Limit sun exposure during midday hours.`);
        } else if (uvIndex >= 3) {
          responses.push(`UV levels are moderate at ${uvIndex.toFixed(1)}. Wear sunscreen and sunglasses when outdoors for extended periods.`);
        } else {
          responses.push(`UV levels are low at ${uvIndex.toFixed(1)}. Still a good idea to wear sunscreen if you'll be outside for long periods.`);
        }
      } else {
        responses.push("UV index information is not currently available.");
      }
    }
    
    // Air Quality questions
    else if (message.includes('air quality') || message.includes('pollution') || message.includes('pm2.5') || 
             message.includes('pm10') || message.includes('dust') || message.includes('smog') || 
             message.includes('breathing') || message.includes('asthma')) {
      
      if (current.pm2_5 !== undefined) {
        const pm25 = current.pm2_5;
        if (pm25 <= 12) {
          responses.push(`Air quality is good with PM2.5 at ${pm25.toFixed(1)} μg/m³. It's safe for everyone to be active outdoors.`);
        } else if (pm25 <= 35.4) {
          responses.push(`Air quality is moderate with PM2.5 at ${pm25.toFixed(1)} μg/m³. Generally fine for most people, but those who are unusually sensitive should consider limiting prolonged outdoor exertion.`);
        } else if (pm25 <= 55.4) {
          responses.push(`Air quality is unhealthy for sensitive groups with PM2.5 at ${pm25.toFixed(1)} μg/m³. People with lung disease, older adults, and children should reduce prolonged outdoor exertion.`);
        } else if (pm25 <= 150.4) {
          responses.push(`Air quality is unhealthy with PM2.5 at ${pm25.toFixed(1)} μg/m³. Everyone may begin to experience health effects. People with lung disease, older adults, and children should avoid prolonged outdoor exertion.`);
        } else if (pm25 <= 250.4) {
          responses.push(`Air quality is very unhealthy with PM2.5 at ${pm25.toFixed(1)} μg/m³. Health alert! Everyone should avoid all outdoor exertion.`);
        } else {
          responses.push(`Air quality is hazardous with PM2.5 at ${pm25.toFixed(1)} μg/m³. Health warning of emergency conditions. The entire population is more likely to be affected.`);
        }
      } else {
        responses.push("Air quality information is not currently available.");
      }
    }
    
    // Check for forecast-related questions first
    else if (message.includes('forecast') || message.includes('tomorrow') || message.includes('next day') || 
        message.includes('future') || message.includes('coming') || message.includes('upcoming') ||
        message.includes('week') || message.includes('next few days') || message.includes('outlook') ||
        message.includes('prediction') || message.includes('expect')) {
      
      // Provide forecast-specific information
      if (message.includes('tomorrow') || message.includes('next day')) {
        if (weatherData.daily.length > 1) {
          const tomorrow = weatherData.daily[1];
          responses.push(`Tomorrow's forecast: High of ${tomorrow.temperature_2m_max}${weatherData.units?.temperature_2m || '°C'}, Low of ${tomorrow.temperature_2m_min}${weatherData.units?.temperature_2m || '°C'} with ${tomorrow.precipitationSum !== undefined ? tomorrow.precipitationSum.toFixed(1) + 'mm' : 'N/A'} precipitation.`);
          
          // Add weather condition
          const weatherDesc = this.getWeatherDescription(tomorrow.weatherCode || 0);
          responses.push(`Weather condition: ${weatherDesc}.`);
        } else {
          responses.push("I don't have tomorrow's forecast data available.");
        }
      } else if (message.includes('week') || message.includes('next few days')) {
        responses.push(`Extended forecast:`);
        const daysToShow = Math.min(5, weatherData.daily.length);
        for (let i = 0; i < daysToShow; i++) {
          const day = weatherData.daily[i];
          const date = new Date((day.date || 0) * 1000);
          const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' });
          responses.push(`${dayName}: High ${day.temperature_2m_max}${weatherData.units?.temperature_2m || '°C'}, Low ${day.temperature_2m_min}${weatherData.units?.temperature_2m || '°C'}, ${day.precipitationSum !== undefined ? day.precipitationSum.toFixed(1) + 'mm' : 'N/A'} precip.`);
        }
      } else {
        // General forecast question
        responses.push(`Today's forecast: High of ${daily.temperature_2m_max}${weatherData.units?.temperature_2m || '°C'}, Low of ${daily.temperature_2m_min}${weatherData.units?.temperature_2m || '°C'} with ${daily.precipitationSum !== undefined ? daily.precipitationSum.toFixed(1) + 'mm' : 'N/A'} precipitation.`);
        
        if (weatherData.daily.length > 1) {
          const tomorrow = weatherData.daily[1];
          responses.push(`Tomorrow: High ${tomorrow.temperature_2m_max}${weatherData.units?.temperature_2m || '°C'}, Low ${tomorrow.temperature_2m_min}${weatherData.units?.temperature_2m || '°C'}, ${tomorrow.precipitationSum !== undefined ? tomorrow.precipitationSum.toFixed(1) + 'mm' : 'N/A'} precip.`);
        }
      }
      
      // Add trend analysis only if specifically asked
      if (message.includes('trend') || message.includes('change') || message.includes('getting')) {
        if (weatherData.daily.length > 2) {
          const temps = weatherData.daily.slice(0, 3).map(day => day.temperature_2m_max);
          if (temps[1] > temps[0] && temps[2] > temps[1]) {
            responses.push("Temperatures are trending upward over the next few days.");
          } else if (temps[1] < temps[0] && temps[2] < temps[1]) {
            responses.push("Temperatures are trending downward over the next few days.");
          } else {
            const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
            responses.push(`Temperatures will be relatively stable, averaging around ${Math.round(avgTemp)}${weatherData.units?.temperature_2m || '°C'}.`);
          }
        }
      }
    }
    
    // Temperature-specific questions
    else if (message.includes('hot') || message.includes('warm') || message.includes('temperature') || 
             message.includes('heat') || message.includes('boiling') || message.includes('scorching') ||
             message.includes('cold') || message.includes('chilly') || message.includes('freezing') || 
             message.includes('cool') || message.includes('freeze')) {
      
      if (message.includes('hot') || message.includes('warm') || message.includes('heat') || 
          message.includes('boiling') || message.includes('scorching')) {
        if (current.temperature_2m > 35) {
          responses.push(`It's scorching hot at ${current.temperature_2m}${weatherData.units?.temperature_2m || '°C'}! Stay hydrated and avoid direct sunlight.`);
        } else if (current.temperature_2m > 30) {
          responses.push(`It's quite warm at ${current.temperature_2m}${weatherData.units?.temperature_2m || '°C'}. Stay hydrated and try to stay in the shade during peak hours.`);
        } else if (current.temperature_2m > 25) {
          responses.push(`It's pleasantly warm at ${current.temperature_2m}${weatherData.units?.temperature_2m || '°C'}. Perfect weather for outdoor activities.`);
        } else {
          responses.push(`The temperature is ${current.temperature_2m}${weatherData.units?.temperature_2m || '°C'}, which is quite comfortable.`);
        }
      } else {
        // Cold-related questions
        if (current.temperature_2m < 0) {
          responses.push(`It's freezing at ${current.temperature_2m}${weatherData.units?.temperature_2m || '°C'}. Make sure to bundle up and dress warmly.`);
        } else if (current.temperature_2m < 5) {
          responses.push(`It's quite cold at ${current.temperature_2m}${weatherData.units?.temperature_2m || '°C'}. Make sure to bundle up and dress warmly.`);
        } else if (current.temperature_2m < 15) {
          responses.push(`It's a bit chilly at ${current.temperature_2m}${weatherData.units?.temperature_2m || '°C'}. A light jacket should be sufficient.`);
        } else {
          responses.push(`The temperature is ${current.temperature_2m}${weatherData.units?.temperature_2m || '°C'}, which is mild.`);
        }
      }
      
      // Add feels-like info if significantly different
      if (Math.abs(current.temperature_2m - current.apparent_temperature) > 3) {
        responses.push(`It feels like ${current.apparent_temperature}${weatherData.units?.temperature_2m || '°C'} due to the humidity and wind.`);
      }
    }
    
    // Precipitation-specific questions
    else if (message.includes('rain') || message.includes('precipitation') || message.includes('shower') || 
             message.includes('should i bring') || message.includes('need umbrella') || message.includes('take umbrella') ||
             message.includes('will it rain') || message.includes('rain tomorrow') || message.includes('wet') || 
             message.includes('dry') || message.includes('storm') || message.includes('snow')) {
      
      const precipitationAmount = daily.precipitationSum ?? 0;
      
      if (message.includes('will it rain') || message.includes('rain tomorrow')) {
        if (precipitationAmount > 10) {
          responses.push(`Yes, there's significant precipitation expected today (${precipitationAmount.toFixed(1)}mm).`);
        } else if (precipitationAmount > 2) {
          responses.push(`There's moderate precipitation expected today (${precipitationAmount.toFixed(1)}mm).`);
        } else {
          responses.push(`It looks like a dry day today with only ${precipitationAmount.toFixed(1)}mm of precipitation expected.`);
        }
        
        // Check tomorrow specifically if asked
        if (message.includes('tomorrow') && weatherData.daily.length > 1) {
          const tomorrow = weatherData.daily[1];
          const tomorrowPrecipitation = tomorrow.precipitationSum ?? 0;
          if (tomorrowPrecipitation > 10) {
            responses.push(`Tomorrow: Significant precipitation expected (${tomorrowPrecipitation.toFixed(1)}mm).`);
          } else if (tomorrowPrecipitation > 2) {
            responses.push(`Tomorrow: Moderate precipitation expected (${tomorrowPrecipitation.toFixed(1)}mm).`);
          } else {
            responses.push(`Tomorrow looks dry with only ${tomorrowPrecipitation.toFixed(1)}mm expected.`);
          }
        }
      } else if (message.includes('should i bring') || message.includes('need umbrella') || message.includes('take umbrella')) {
        if (precipitationAmount > 10) {
          responses.push("Yes, you should definitely bring an umbrella today. Significant precipitation is expected.");
        } else if (precipitationAmount > 2) {
          responses.push("You might want to bring an umbrella just in case. Moderate precipitation is expected.");
        } else {
          responses.push("No need for an umbrella today. Precipitation amounts are low.");
        }
      } else if (message.includes('snow')) {
        // Check for snow conditions
        const weatherCode = daily.weatherCode || 0;
        const snowy = weatherCode && (weatherCode >= 71 && weatherCode <= 77);
        if (snowy) {
          responses.push("Yes, snow is expected today.");
        } else {
          responses.push("No snow is expected today.");
        }
      } else {
        // General precipitation question
        responses.push(`There's ${precipitationAmount.toFixed(1)}mm of precipitation expected today. ${precipitationAmount > 10 ? 'Expect significant rain.' : precipitationAmount > 2 ? 'Possible showers.' : 'Mostly dry conditions.'}`);
      }
    }
    
    // Wind-specific questions
    else if (message.includes('wind') || message.includes('breezy') || message.includes('windy') || 
             message.includes('blustery') || message.includes('calm')) {
      const windSpeed = current.wind_speed_10m || 0;
      if (windSpeed > 30) {
        responses.push(`It's quite windy with speeds of ${windSpeed} ${weatherData.units?.wind_speed_10m || 'km/h'}. Secure any loose items outside.`);
      } else if (windSpeed > 15) {
        responses.push(`There's a gentle breeze with winds at ${windSpeed} ${weatherData.units?.wind_speed_10m || 'km/h'}. Perfect for flying a kite!`);
      } else {
        responses.push(`Winds are light at ${windSpeed} ${weatherData.units?.wind_speed_10m || 'km/h'}.`);
      }
    }
    
    // Humidity-specific questions
    else if (message.includes('humidity') || message.includes('humid') || message.includes('muggy') || 
             message.includes('sticky') || message.includes('dry')) {
      const humidity = current.relative_humidity_2m || 0;
      if (humidity > 80) {
        responses.push(`It's quite humid at ${humidity}%. This can make it feel warmer than the actual temperature.`);
      } else if (humidity > 60) {
        responses.push(`Humidity is at ${humidity}%, which is moderately humid.`);
      } else {
        responses.push(`Humidity is at ${humidity}%, which is quite comfortable.`);
      }
    }
    
    // Sun/Sky condition questions
    else if (message.includes('sun') || message.includes('sunny') || message.includes('clear sky') || 
             message.includes('cloud') || message.includes('overcast')) {
      const weatherDesc = this.getWeatherDescription(current.weather_code);
      responses.push(`It's currently ${weatherDesc.toLowerCase()}.`);
      
      if (weatherDesc.toLowerCase().includes('clear') || weatherDesc.toLowerCase().includes('sunny')) {
        responses.push("Yes, it's sunny and clear today. Great weather for outdoor activities!");
      } else if (weatherDesc.toLowerCase().includes('cloud')) {
        responses.push("Partly cloudy with some sun.");
      }
    }
    
    // Clothing recommendations
    else if (message.includes('what should i wear') || message.includes('what to wear') || 
             message.includes('clothes') || message.includes('dress')) {
      if (current.temperature_2m > 30) {
        responses.push("Wear light, breathable clothing. Consider a hat and sunscreen for sun protection.");
      } else if (current.temperature_2m > 20) {
        responses.push("Light clothing with a light jacket or sweater for cooler evenings would be perfect.");
      } else if (current.temperature_2m > 10) {
        responses.push("Dress in layers with a warm jacket. A scarf and gloves might be comfortable.");
      } else {
        responses.push("Bundle up warmly with a heavy coat, gloves, and scarf. Don't forget a warm hat.");
      }
    }
    
    // Activity recommendations
    else if (message.includes('when is the best time') || message.includes('best time for') || 
             message.includes('outdoor') || message.includes('activity')) {
      const timeRecommendations: string[] = [];
      const precipitationAmount = daily.precipitationSum ?? 0;
      
      if (precipitationAmount > 10) {
        timeRecommendations.push("early morning or late evening when precipitation is typically lower");
      }
      
      if (current.temperature_2m > 30) {
        timeRecommendations.push("early morning or evening to avoid the peak heat");
      }
      
      const windSpeed = current.wind_speed_10m || 0;
      if (windSpeed > 30) {
        timeRecommendations.push("when winds are calmer");
      }
      
      if (timeRecommendations.length > 0) {
        responses.push(`The best time would be ${timeRecommendations.join(' and ')}.`);
      } else {
        responses.push("Weather conditions look good throughout the day for outdoor activities.");
      }
    }
    
    // If no specific responses were generated, provide a general response
    if (responses.length === 0) {
      responses.push(`I understand you're asking about "${userMessage}".`);
      
      // Provide context based on what seems most relevant
      if (message.includes('temperature') || message.includes('hot') || message.includes('cold')) {
        responses.push(`Currently it's ${current.temperature_2m}${weatherData.units?.temperature_2m || '°C'} and ${this.getWeatherDescription(current.weather_code).toLowerCase()}.`);
      } else if (message.includes('rain') || message.includes('precipitation')) {
        responses.push(`There's ${daily.precipitationSum !== undefined ? daily.precipitationSum.toFixed(1) + 'mm' : 'N/A'} of precipitation expected today.`);
      } else if (message.includes('wind')) {
        responses.push(`Winds are blowing at ${current.wind_speed_10m || 0} ${weatherData.units?.wind_speed_10m || 'km/h'}.`);
      } else {
        // Default general response
        responses.push(`Currently it's ${current.temperature_2m}${weatherData.units?.temperature_2m || '°C'} and ${this.getWeatherDescription(current.weather_code).toLowerCase()}.`);
        responses.push(`Today's high will be ${daily.temperature_2m_max}${weatherData.units?.temperature_2m || '°C'} with ${daily.precipitationSum !== undefined ? daily.precipitationSum.toFixed(1) + 'mm' : 'N/A'} of precipitation expected.`);
      }
    }
    
    // Return a combined response (1-3 relevant responses)
    const relevantResponses = responses.slice(0, 3);
    return relevantResponses.join(" ");
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
  
  // Future implementation for actual API usage (commented out for now)
  /*
  private async getAIResponse(prompt: string): Promise<string> {
    try {
      const response = await fetch(HUGGING_FACE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${this.apiKey}` // Not required for basic models
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 100,
            temperature: 0.7,
            top_p: 0.9,
          }
        })
      });
      
      const data = await response.json();
      return data[0].generated_text;
    } catch (error) {
      console.error('Error calling Hugging Face API:', error);
      throw error;
    }
  }
  */
}

// Create a singleton instance
export const chatbotService = new ChatbotService();