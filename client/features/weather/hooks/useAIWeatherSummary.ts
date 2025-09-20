import { useState, useEffect } from 'react';
import { WeatherPayload } from '../model/types';
import { createAIProvider, AIProvider } from '../services/aiWeatherSummary';

interface UseAIWeatherSummaryProps {
  weatherData: WeatherPayload | null;
  apiKey?: string;
}

export function useAIWeatherSummary({
  weatherData,
  apiKey
}: UseAIWeatherSummaryProps) {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateSummary = async () => {
      console.log('useAIWeatherSummary: generateSummary called');
      console.log('Weather data present:', !!weatherData);
      console.log('API key present:', !!apiKey);
      
      // Don't generate if no weather data or no API key
      if (!weatherData || !apiKey) {
        console.log('useAIWeatherSummary: No weather data or API key, returning early');
        setSummary('');
        return;
      }

      // Create OpenAI provider
      let aiProvider: AIProvider;
      try {
        console.log('useAIWeatherSummary: Creating AI provider');
        aiProvider = createAIProvider(apiKey);
      } catch (err: any) {
        console.error('useAIWeatherSummary: Failed to initialize OpenAI provider:', err);
        setError(`Failed to initialize OpenAI provider: ${err.message}`);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('useAIWeatherSummary: Generating weather summary');
        const generatedSummary = await aiProvider.generateWeatherSummary(weatherData);
        console.log('useAIWeatherSummary: Generated summary:', generatedSummary);
        setSummary(generatedSummary);
      } catch (err: any) {
        console.error('useAIWeatherSummary: Failed to generate weather summary:', err);
        setError(`Failed to generate weather summary: ${err.message}`);
        setSummary('');
      } finally {
        setLoading(false);
      }
    };

    generateSummary();
  }, [weatherData, apiKey]);

  return {
    summary,
    loading,
    error
  };
}