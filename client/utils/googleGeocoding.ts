/**
 * Google Geocoding API Integration
 * Provides reliable reverse geocoding and location search using Google's APIs
 */

import { Coordinates } from '../features/weather/model/types';

// Environment variable for Google API key
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

interface GoogleGeocodingResponse {
  results: Array<{
    formatted_address: string;
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
  status: string;
}

interface CityInfo {
  name: string;
  country: string;
  formatted_address: string;
}

/**
 * Reverse geocode coordinates to get city information using Google API
 */
export async function reverseGeocode(coords: Coordinates): Promise<CityInfo> {
  if (!GOOGLE_API_KEY) {
    console.warn('Google API key not configured, using fallback');
    throw new Error('Google API key not configured');
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lon}&key=${GOOGLE_API_KEY}&language=en&result_type=locality|sublocality|administrative_area_level_1`;

    console.log('🌍 Making Google geocoding request for coordinates:', coords);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data: GoogleGeocodingResponse = await response.json();
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      throw new Error(`Geocoding failed: ${data.status}`);
    }

    const result = data.results[0];
    const addressComponents = result.address_components;

    // Extract city name and country from address components
    let cityName = '';
    let country = '';

    for (const component of addressComponents) {
      const types = component.types;
      
      // Look for city/locality first
      if (types.includes('locality')) {
        cityName = component.long_name;
      } else if (types.includes('sublocality') && !cityName) {
        cityName = component.long_name;
      } else if (types.includes('administrative_area_level_1') && !cityName) {
        cityName = component.long_name;
      }
      
      // Look for country
      if (types.includes('country')) {
        country = component.long_name;
      }
    }

    // Fallback to formatted address parsing if components don't work
    if (!cityName) {
      const addressParts = result.formatted_address.split(',');
      cityName = addressParts[0]?.trim() || 'Unknown Location';
    }

    const cityInfo: CityInfo = {
      name: cityName || 'Unknown Location',
      country: country || '',
      formatted_address: result.formatted_address
    };

    console.log('✅ Google geocoding successful:', cityInfo);
    return cityInfo;

  } catch (error) {
    console.error('❌ Google geocoding failed:', error);
    throw error;
  }
}

/**
 * Search for cities using Google Places API
 */
export async function searchCitiesGoogle(query: string): Promise<Array<{
  name: string;
  country: string;
  lat: number;
  lon: number;
  formatted_address: string;
}>> {
  if (!GOOGLE_API_KEY) {
    console.warn('Google API key not configured for places search');
    throw new Error('Google API key not configured');
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&language=en&result_type=locality|administrative_area_level_1`;

    console.log('🔍 Searching cities with Google API:', query);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data: GoogleGeocodingResponse = await response.json();
    
    if (data.status !== 'OK' || !data.results) {
      return [];
    }

    const cities = data.results.slice(0, 10).map(result => {
      const addressComponents = result.address_components;
      let cityName = '';
      let country = '';

      for (const component of addressComponents) {
        const types = component.types;
        
        if (types.includes('locality')) {
          cityName = component.long_name;
        } else if (types.includes('administrative_area_level_1') && !cityName) {
          cityName = component.long_name;
        }
        
        if (types.includes('country')) {
          country = component.long_name;
        }
      }

      if (!cityName) {
        const addressParts = result.formatted_address.split(',');
        cityName = addressParts[0]?.trim() || 'Unknown';
      }

      return {
        name: cityName || 'Unknown',
        country: country || '',
        lat: result.geometry.location.lat,
        lon: result.geometry.location.lng,
        formatted_address: result.formatted_address
      };
    });

    console.log('✅ Google places search results:', cities.length);
    return cities;

  } catch (error) {
    console.error('❌ Google places search failed:', error);
    throw error;
  }
}