import * as Location from 'expo-location';
import { Coordinates } from '../features/weather/model/types';

interface LocationResult {
  coords: Coordinates | null;
  permission: Location.LocationPermissionResponse['status'];
  error?: string;
}

class LocationService {
  private static instance: LocationService;
  private locationPromise: Promise<LocationResult> | null = null;
  private lastResult: LocationResult | null = null;
  private lastRequestTime: number = 0;

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  public async getCurrentLocation(maxAge: number = 60000): Promise<LocationResult> {
    // Return cached result if it's recent enough (within maxAge milliseconds)
    const now = Date.now();
    if (this.lastResult && (now - this.lastRequestTime) < maxAge) {
      console.log('🔄 Using cached location result');
      return this.lastResult;
    }

    // If there's already a location request in progress, wait for it
    if (this.locationPromise) {
      console.log('🔄 Location request already in progress, waiting...');
      return this.locationPromise;
    }

    // Start new location request
    console.log('🎯 Starting new location detection...');
    this.locationPromise = this.performLocationDetection();
    this.lastRequestTime = now;

    try {
      this.lastResult = await this.locationPromise;
      return this.lastResult;
    } finally {
      this.locationPromise = null;
    }
  }

  private async performLocationDetection(): Promise<LocationResult> {
    try {
      console.log('🔄 Checking location permission...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Location permission status:', status);

      if (status !== 'granted') {
        return {
          coords: null,
          permission: status,
          error: 'Location permission not granted'
        };
      }

      try {
        console.log('🎯 Attempting location detection...');
        
        const location = await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 100,
          }),
          new Promise<Location.LocationObject>((_, reject) => 
            setTimeout(() => reject(new Error('Location detection timeout')), 15000)
          )
        ]);

        console.log('✅ Location detection successful:', location.coords.latitude, location.coords.longitude);
        
        return {
          coords: {
            lat: location.coords.latitude,
            lon: location.coords.longitude,
          },
          permission: status,
        };
      } catch (locationError) {
        console.log('⚠️ Location detection failed:', (locationError as Error).message);
        return {
          coords: null,
          permission: status,
          error: (locationError as Error).message,
        };
      }
    } catch (error) {
      console.log('❌ Location service error:', error);
      return {
        coords: null,
        permission: Location.PermissionStatus.DENIED,
        error: (error as Error).message,
      };
    }
  }

  public clearCache(): void {
    this.lastResult = null;
    this.lastRequestTime = 0;
    this.locationPromise = null;
  }
}

export const locationService = LocationService.getInstance();