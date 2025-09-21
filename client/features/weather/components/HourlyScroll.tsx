import { ScrollView, View, Text, StyleSheet, Platform } from 'react-native';
import { HourlyEntry } from '../model/types';
import { useUnitStore } from '../../../store/unitSlice';
import { toF } from '../../../utils/conversions';
import { getWeatherIconWithTime } from '../../../utils/weatherIcons';

type Props = { 
  hourly: HourlyEntry[];
  sunrise?: number;
  sunset?: number;
};

export function HourlyScroll({ hourly, sunrise, sunset }: Props) {
  const unit = useUnitStore((s) => s.unit);

  const getTimeString = (timestamp: number, index: number) => {
    if (index === 0) return 'Now';
    const date = new Date(timestamp * 1000);
    const hours = date.getHours();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}${period}`;
  };

  const getWeatherIcon = (weatherCode: number, time: number) => {
    console.log('HourlyScroll - Weather Code:', weatherCode, 'Time:', new Date(time * 1000).toLocaleString());
    const icon = getWeatherIconWithTime(weatherCode, time, sunrise, sunset);
    console.log('HourlyScroll - Generated Icon:', icon, 'for weather code:', weatherCode);
    return icon;
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {hourly.slice(0, 8).map((h, i) => {
          const temp = Math.round(unit === 'C' ? h.tempC : toF(h.tempC));
          // Temporary: Test with different weather codes if the API returns 0
          let testWeatherCode = h.weatherCode ?? 0;
          if (testWeatherCode === 0 && i > 0) {
            // Use different codes for testing
            const testCodes = [1, 2, 3, 45, 51, 61, 63, 71, 73, 95];
            testWeatherCode = testCodes[i % testCodes.length];
            console.log(`🧪 Testing with weather code ${testWeatherCode} for hour ${i}`);
          }
          const weatherIcon = getWeatherIcon(testWeatherCode, h.time);
          return (
            <View key={i} style={styles.hourlyCard}>
              <Text style={styles.timeText}>{getTimeString(h.time, i)}</Text>
              <Text style={styles.iconText}>{weatherIcon || '☀️'}</Text>
              <Text style={styles.tempText}>{`${temp}°`}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 24,
    paddingVertical: 28,
    marginVertical: 20,
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
  scrollContent: {
    paddingHorizontal: 20,
  },
  hourlyCard: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: 75,
  },
  timeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 16,
    fontFamily: 'Inter',
    letterSpacing: 0.3,
  },
  iconText: {
    fontSize: 28,
    marginBottom: 16,
  },
  tempText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter',
    letterSpacing: 0.2,
  },
});