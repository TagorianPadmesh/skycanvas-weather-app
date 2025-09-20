import { City } from '../features/weather/model/types';
import { locationService } from './locationService';
import { storage } from './storage';

class LocationManager {
  private static instance: LocationManager;
  private isDetecting = false;
  private detectionPromise: Promise<City | null> | null = null;

  public static getInstance(): LocationManager {
    if (!LocationManager.instance) {
      LocationManager.instance = new LocationManager();
    }
    return LocationManager.instance;
  }

  // Get user location with caching - only detects once per app session or cache expiry
  public async getUserLocation(): Promise<City | null> {
    console.log('\n=== USER LOCATION MANAGER ==>');
    
    // First, try to get cached location
    const cachedLocation = await storage.getUserLocation();
    if (cachedLocation) {
      console.log('✅ Using cached user location:', cachedLocation.name);
      console.log('=== CACHED LOCATION RETRIEVED ===\n');
      return cachedLocation;
    }

    // If detection is already in progress, return the promise
    if (this.isDetecting && this.detectionPromise) {
      console.log('🔄 Location detection already in progress, waiting...');
      return this.detectionPromise;
    }

    // Start new location detection
    console.log('🎯 Starting fresh location detection...');
    this.isDetecting = true;
    this.detectionPromise = this.detectAndCacheLocation();

    try {
      const result = await this.detectionPromise;
      return result;
    } finally {
      this.isDetecting = false;
      this.detectionPromise = null;
    }
  }

  private async detectAndCacheLocation(): Promise<City | null> {
    try {
      console.log('Step 1: Getting device location...');
      const locationResult = await locationService.getCurrentLocation();
      
      if (!locationResult.coords) {
        console.log('⚠️ No coordinates available:', locationResult.error || 'Permission denied');
        return null;
      }

      console.log('Step 2: Got coordinates:', locationResult.coords.lat, locationResult.coords.lon);
      console.log('Step 3: Fetching city name from weather API...');

      try {
        // Use the weather API to get proper city name through reverse geocoding
        const { fetchWeatherFromOpenMeteo } = await import('../features/weather/api/providers/openMeteo');
        const weatherData = await fetchWeatherFromOpenMeteo(locationResult.coords);
        
        const userLocation: City = {
          name: weatherData.city.name,
          country: weatherData.city.country,
          lat: locationResult.coords.lat,
          lon: locationResult.coords.lon,
          timezone: weatherData.city.timezone,
          utcOffset: weatherData.city.utcOffset,
        };

        console.log('Step 4: City name resolved:', userLocation.name);
        console.log('Step 5: Caching location for future use...');
        
        // Cache the location for future use
        await storage.setUserLocation(userLocation);
        
        console.log('✅ Location detection and caching completed successfully');
        console.log('=== LOCATION DETECTION COMPLETE ===\n');
        
        return userLocation;
      } catch (error) {
        console.log('⚠️ Failed to get city name, using coordinates fallback:', error);
        
        // Fallback to coordinates if reverse geocoding fails
        const lat = locationResult.coords.lat.toFixed(3);
        const lon = locationResult.coords.lon.toFixed(3);
        const latDir = locationResult.coords.lat >= 0 ? 'N' : 'S';
        const lonDir = locationResult.coords.lon >= 0 ? 'E' : 'W';
        const locationName = `${Math.abs(parseFloat(lat))}°${latDir}, ${Math.abs(parseFloat(lon))}°${lonDir}`;
        
        const fallbackLocation: City = {
          name: locationName,
          country: 'Your Location',
          lat: locationResult.coords.lat,
          lon: locationResult.coords.lon,
        };

        // Cache even the fallback location
        await storage.setUserLocation(fallbackLocation);
        
        console.log('✅ Fallback location cached:', fallbackLocation.name);
        console.log('=== FALLBACK LOCATION COMPLETE ===\n');
        
        return fallbackLocation;
      }
    } catch (error) {
      console.log('❌ Location detection failed completely:', error);
      console.log('=== LOCATION DETECTION FAILED ===\n');
      return null;
    }
  }

  // Force refresh location (for settings or manual refresh)
  public async refreshLocation(): Promise<City | null> {
    console.log('🔄 Forcing location refresh...');
    
    // Clear cached location
    await storage.clearUserLocation();
    
    // Clear location service cache too
    locationService.clearCache();
    
    // Get fresh location
    return this.getUserLocation();
  }

  // Check if user has a cached location
  public async hasCachedLocation(): Promise<boolean> {
    const cachedLocation = await storage.getUserLocation();
    return cachedLocation !== null;
  }
}

export const locationManager = LocationManager.getInstance();