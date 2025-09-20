import { View, Text, StyleSheet, Platform } from 'react-native';
import { City, CurrentWeather, WeatherPayload } from '../model/types';
import { useUnitStore } from '../../../store/unitSlice';
import { toF } from '../../../utils/conversions';
import AIWeatherSummary from './AIWeatherSummary';
import AirQualityCard from './AirQualityCard';

type Props = {
  city: City;
  current: CurrentWeather;
  weatherPayload?: WeatherPayload;
};

export function PrimaryWeatherCard({ city, current, weatherPayload }: Props) {
  const unit = useUnitStore((s) => s.unit);
  const temp = Math.round(unit === 'C' ? current.tempC : toF(current.tempC));
  const feelsLike = Math.round(unit === 'C' ? current.feelsLikeC : toF(current.feelsLikeC));
  const high = Math.round(temp + 3);
  const low = Math.round(temp - 8);

  // Better city name display logic
  const displayCityName = city.name && city.name !== 'Unknown City' && city.name !== 'Current Location' 
    ? city.name.toUpperCase() 
    : 'CURRENT LOCATION';

  return (
    <View style={styles.container}>
      {/* City Name */}
      <Text style={styles.cityName}>{displayCityName}</Text>
      
      {/* Giant Temperature Display */}
      <Text style={styles.temperature}>{temp}°</Text>
      
      {/* Weather Description */}
      <Text style={styles.description}>{current.weatherDescription}</Text>
      
      {/* High/Low */}
      <Text style={styles.highLow}>H:{high}°  L:{low}°</Text>
      
      {/* Air Quality & UV Index Card */}
      {(current.uvIndex !== undefined || current.pm25 !== undefined) && (
        <AirQualityCard current={current} />
      )}
      
      {/* AI Weather Summary */}
      {weatherPayload && (
        <AIWeatherSummary weatherData={weatherPayload} />
      )}
      
      {/* Bottom description card */}
      <View style={styles.bottomCard}>
        <Text style={styles.bottomText}>
          {current.weatherDescription} conditions will continue all day. Wind gusts are up to {Math.round(current.windSpeedKmh)} km/h.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  cityName: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 50,
    textAlign: 'center',
    lineHeight: 32,
    fontFamily: 'Inter',
    paddingHorizontal: 10,
    opacity: 1,
    zIndex: 10,
  },
  temperature: {
    color: '#fff',
    fontSize: 120,
    fontWeight: '300',
    lineHeight: 110,
    marginBottom: 16,
    letterSpacing: -6,
    fontFamily: 'Inter',
  },
  description: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '400',
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  highLow: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 30, // Increased margin to separate from AI summary
    letterSpacing: 1.2,
    fontFamily: 'Inter',
  },
  bottomCard: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    ...(Platform.OS !== 'web' ? {
      shadowColor: 'rgba(0,0,0,0.2)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 8,
    } : {}),
  },
  bottomText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
    fontWeight: '400',
    fontFamily: 'Inter',
    letterSpacing: 0.2,
  },
});