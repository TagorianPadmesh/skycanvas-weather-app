import AsyncStorage from '@react-native-async-storage/async-storage';
import { City } from '../features/weather/model/types';

const STORAGE_KEYS = {
  REMEMBER_ME: 'weather_app_remember_me',
  USER_EMAIL: 'weather_app_user_email',
  SAVED_CITIES: 'weather_app_saved_cities',
  USER_LOCATION: 'weather_app_user_location',
} as const;

export const storage = {
  // Remember Me functionality
  async setRememberMe(remember: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, remember.toString());
    } catch (error) {
      console.error('Error setting remember me preference:', error);
    }
  },

  async getRememberMe(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
      return value === 'true';
    } catch (error) {
      console.error('Error getting remember me preference:', error);
      return false;
    }
  },

  // User email for convenience
  async setUserEmail(email: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_EMAIL, email);
    } catch (error) {
      console.error('Error setting user email:', error);
    }
  },

  async getUserEmail(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL);
    } catch (error) {
      console.error('Error getting user email:', error);
      return null;
    }
  },

  async clearRememberMe(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.REMEMBER_ME, STORAGE_KEYS.USER_EMAIL]);
    } catch (error) {
      console.error('Error clearing remember me data:', error);
    }
  },

  // Saved cities functionality
  async setSavedCities(cities: City[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_CITIES, JSON.stringify(cities));
    } catch (error) {
      console.error('Error setting saved cities:', error);
    }
  },

  async getSavedCities(): Promise<City[]> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_CITIES);
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting saved cities:', error);
      return [];
    }
  },

  async addSavedCity(city: City): Promise<void> {
    try {
      const existingCities = await this.getSavedCities();
      // Check if city already exists (by coordinates)
      const exists = existingCities.some(
        (existingCity) => 
          Math.abs(existingCity.lat - city.lat) < 0.01 && 
          Math.abs(existingCity.lon - city.lon) < 0.01
      );
      
      if (!exists) {
        const updatedCities = [...existingCities, city];
        await this.setSavedCities(updatedCities);
      }
    } catch (error) {
      console.error('Error adding saved city:', error);
    }
  },

  async removeSavedCity(city: City): Promise<void> {
    try {
      const existingCities = await this.getSavedCities();
      const updatedCities = existingCities.filter(
        (existingCity) => 
          !(Math.abs(existingCity.lat - city.lat) < 0.01 && 
            Math.abs(existingCity.lon - city.lon) < 0.01)
      );
      await this.setSavedCities(updatedCities);
    } catch (error) {
      console.error('Error removing saved city:', error);
    }
  },

  // User location caching
  async setUserLocation(location: City): Promise<void> {
    try {
      const locationData = {
        ...location,
        timestamp: Date.now(), // Add timestamp for cache validation
      };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_LOCATION, JSON.stringify(locationData));
      console.log('✅ User location saved to cache:', location.name);
    } catch (error) {
      console.error('Error setting user location:', error);
    }
  },

  async getUserLocation(maxAge: number = 24 * 60 * 60 * 1000): Promise<City | null> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.USER_LOCATION);
      if (!value) {
        console.log('No cached user location found');
        return null;
      }

      const locationData = JSON.parse(value);
      const now = Date.now();
      
      // Check if cached location is still valid (default 24 hours)
      if (locationData.timestamp && (now - locationData.timestamp) > maxAge) {
        console.log('Cached user location expired, clearing cache');
        await this.clearUserLocation();
        return null;
      }

      console.log('✅ Using cached user location:', locationData.name);
      // Remove timestamp before returning
      const { timestamp, ...location } = locationData;
      return location;
    } catch (error) {
      console.error('Error getting user location:', error);
      return null;
    }
  },

  async clearUserLocation(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_LOCATION);
      console.log('User location cache cleared');
    } catch (error) {
      console.error('Error clearing user location:', error);
    }
  },
};