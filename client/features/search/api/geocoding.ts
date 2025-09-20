// features/search/api/geocoding.ts
export async function searchCities(query: string): Promise<Array<{ name: string; country: string; lat: number; lon: number }>> {
  console.log('\n=== GEOCODING API CALL ==>');
  console.log('Query:', query);
  
  try {
    // Try Google API first if available
    try {
      const { searchCitiesGoogle } = await import('../../../utils/googleGeocoding');
      const googleResults = await searchCitiesGoogle(query);
      if (googleResults.length > 0) {
        console.log('✅ Google API results:', googleResults.length);
        const processedResults = googleResults.map(city => ({
          name: city.name,
          country: city.country,
          lat: city.lat,
          lon: city.lon,
        }));
        console.log('=== GOOGLE GEOCODING COMPLETE ===\n');
        return processedResults;
      }
    } catch (googleError) {
      console.log('⚠️ Google API not available or failed, using fallback:', googleError);
    }

    // Fallback to Open-Meteo geocoding
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
    console.log('API URL:', url);
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'WeatherApp/1.0'
      }
    });
    
    console.log('Response status:', res.status);
    console.log('Response ok:', res.ok);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('API response data:', data);
    
    const results = (data.results ?? []).map((c: any) => ({
      name: c.name,
      country: c.country || c.country_code || 'Unknown',
      lat: c.latitude,
      lon: c.longitude,
    }));
    
    console.log('Processed results:', results);
    console.log('=== OPEN-METEO GEOCODING COMPLETE ===\n');
    
    return results;
  } catch (error) {
    console.error('❌ Geocoding API error:', error);
    console.log('=== GEOCODING API FAILED ===\n');
    throw error;
  }
}