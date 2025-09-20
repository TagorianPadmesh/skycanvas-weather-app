import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CurrentWeather } from '../model/types';

interface AirQualityCardProps {
  current: CurrentWeather;
}

const AirQualityCard: React.FC<AirQualityCardProps> = ({ current }) => {
  // Calculate AQI based on PM2.5 levels (simplified)
  const calculateAQI = (pm25: number): number => {
    if (pm25 <= 12) return Math.round((50 / 12) * pm25);
    if (pm25 <= 35.4) return Math.round(51 + ((49 / 23.4) * (pm25 - 12.1)));
    if (pm25 <= 55.4) return Math.round(101 + ((49 / 20) * (pm25 - 35.5)));
    if (pm25 <= 150.4) return Math.round(151 + ((49 / 95) * (pm25 - 55.5)));
    if (pm25 <= 250.4) return Math.round(201 + ((99 / 100) * (pm25 - 150.5)));
    return Math.round(301 + ((99 / 100) * (pm25 - 250.5)));
  };

  // Get AQI level text and color
  const getAQILevel = (aqi: number) => {
    if (aqi <= 50) return { level: 'Good', color: '#00E400' };
    if (aqi <= 100) return { level: 'Moderate', color: '#FFFF00' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: '#FF7E00' };
    if (aqi <= 200) return { level: 'Unhealthy', color: '#FF0000' };
    if (aqi <= 300) return { level: 'Very Unhealthy', color: '#8F3F97' };
    return { level: 'Hazardous', color: '#7E0023' };
  };

  // Get UV index level text and color
  const getUVLevel = (uvIndex: number) => {
    if (uvIndex <= 2) return { level: 'Low', color: '#32CD32' };
    if (uvIndex <= 5) return { level: 'Moderate', color: '#FFFF00' };
    if (uvIndex <= 7) return { level: 'High', color: '#FFA500' };
    if (uvIndex <= 10) return { level: 'Very High', color: '#FF0000' };
    return { level: 'Extreme', color: '#800080' };
  };

  // Use uvIndex if available and > 0, otherwise show 0
  // The UV index should now be the daily maximum from our API implementation
  const uvIndex = current.uvIndex !== undefined ? current.uvIndex : 0;
  const pm25 = current.pm25 || 0;
  const pm10 = current.pm10 || 0;
  
  const aqi = calculateAQI(pm25);
  const uvLevel = getUVLevel(uvIndex);
  const aqiLevel = getAQILevel(aqi);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Air Quality & UV Index</Text>
      
      <View style={styles.row}>
        <View style={styles.metricContainer}>
          <Text style={styles.metricLabel}>UV Index</Text>
          <Text style={[styles.metricValue, { color: uvLevel.color }]}>{uvIndex.toFixed(1)}</Text>
          <Text style={[styles.metricLevel, { color: uvLevel.color }]}>{uvLevel.level}</Text>
        </View>
        
        <View style={styles.metricContainer}>
          <Text style={styles.metricLabel}>Air Quality</Text>
          <Text style={[styles.metricValue, { color: aqiLevel.color }]}>{aqi}</Text>
          <Text style={[styles.metricLevel, { color: aqiLevel.color }]}>{aqiLevel.level}</Text>
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>PM2.5:</Text>
          <Text style={styles.detailValue}>{pm25.toFixed(1)} μg/m³</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>PM10:</Text>
          <Text style={styles.detailValue}>{pm10.toFixed(1)} μg/m³</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  metricContainer: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 3,
  },
  metricLevel: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 15,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  detailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default AirQualityCard;