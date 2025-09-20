import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAIWeatherSummary } from '../hooks/useAIWeatherSummary';
import { WeatherPayload } from '../model/types';
import Constants from 'expo-constants';

interface AIWeatherSummaryProps {
  weatherData: WeatherPayload | null;
}

const AIWeatherSummary: React.FC<AIWeatherSummaryProps> = ({ 
  weatherData
}) => {
  // Get OpenAI API key from environment variables
  const apiKey = Constants.expoConfig?.extra?.openAIApiKey;
  
  // State to track if we're using fallback
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  
  const { summary, loading, error } = useAIWeatherSummary({
    weatherData,
    apiKey: apiKey as string | undefined
  });

  // Update fallback state when summary changes
  useEffect(() => {
    if (summary && (summary.startsWith('Current weather:') || summary.includes('Expect') || summary.includes('Currently'))) {
      setIsUsingFallback(true);
    } else {
      setIsUsingFallback(false);
    }
  }, [summary]);

  // Don't render anything if there's no API key
  if (!apiKey) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Weather Insight</Text>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
        <Text style={styles.summary}>Generating your personalized weather summary...</Text>
      </View>
    );
  }

  if (error) {
    return null;
  }

  if (!summary) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isUsingFallback ? 'Weather Insight' : 'AI Weather Insight'}
        </Text>
      </View>
      <Text style={styles.summary}>{summary}</Text>
      {isUsingFallback && (
        <Text style={styles.fallbackNote}>
          Personalized summaries available with active API key
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  summary: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.95)',
    fontFamily: 'Inter',
    fontWeight: '400',
  },
  fallbackNote: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 12,
    fontStyle: 'italic',
    textAlign: 'right',
  },
});

export default AIWeatherSummary;