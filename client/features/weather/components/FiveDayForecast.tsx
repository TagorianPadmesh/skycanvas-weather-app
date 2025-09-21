import { View, Text, StyleSheet, Platform } from 'react-native';
import { DailyEntry } from '../model/types';
import { useUnitStore } from '../../../store/unitSlice';
import { toF } from '../../../utils/conversions';
import { getWeatherIcon } from '../../../utils/weatherIcons';

type Props = { daily: DailyEntry[] };

export function FiveDayForecast({ daily }: Props) {
  const unit = useUnitStore((s) => s.unit);

  const getDayName = (timestamp: number, index: number) => {
    if (index === 0) return 'Today';
    return new Date(timestamp * 1000).toLocaleDateString(undefined, { weekday: 'short' });
  };

  const getWeatherIconForDay = (weatherCode: number) => {
    console.log('FiveDayForecast - Weather Code:', weatherCode);
    const icon = getWeatherIcon(weatherCode, true);
    console.log('FiveDayForecast - Generated Icon:', icon, 'for weather code:', weatherCode);
    return icon;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>10-DAY FORECAST</Text>
      
      {daily.slice(0, 10).map((d, i) => {
        const min = Math.round(unit === 'C' ? d.tempMinC : toF(d.tempMinC));
        const max = Math.round(unit === 'C' ? d.tempMaxC : toF(d.tempMaxC));
        // Temporary: Test with different weather codes if the API returns 0
        let testWeatherCode = d.weatherCode ?? 0;
        if (testWeatherCode === 0 && i > 0) {
          // Use different codes for testing
          const testCodes = [1, 2, 3, 45, 51, 61, 63, 71, 73, 95];
          testWeatherCode = testCodes[i % testCodes.length];
          console.log(`🧪 Testing daily with weather code ${testWeatherCode} for day ${i}`);
        }
        const weatherIcon = getWeatherIconForDay(testWeatherCode);
        return (
          <View key={i} style={[styles.dailyRow, i === daily.length - 1 && styles.lastRow]}>
            <Text style={styles.dayText}>{getDayName(d.date, i)}</Text>
            <Text style={styles.iconText}>{weatherIcon || '☀️'}</Text>
            <View style={styles.tempContainer}>
              <Text style={styles.lowTemp}>{`${min}°`}</Text>
              <View style={styles.tempBar} />
              <Text style={styles.highTemp}>{`${max}°`}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    padding: 24,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 20,
    paddingLeft: 4,
  },
  dailyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'space-between',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  dayText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    width: 65,
  },
  iconText: {
    fontSize: 26,
    marginHorizontal: 16,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 130,
  },
  lowTemp: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 17,
    fontWeight: '500',
    marginRight: 10,
    width: 30,
    textAlign: 'right',
  },
  tempBar: {
    backgroundColor: '#FF9500',
    width: 45,
    height: 5,
    borderRadius: 2.5,
    marginHorizontal: 10,
  },
  highTemp: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    width: 30,
    textAlign: 'right',
  },
});