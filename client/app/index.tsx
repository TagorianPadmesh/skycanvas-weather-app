import { View, Text, ScrollView, StyleSheet, Alert, StatusBar, TouchableOpacity, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useWeather } from '../features/weather/hooks/useWeather';
import { useCitySearch } from '../features/search/hooks/useCitySearch';
import { PrimaryWeatherCard } from '../features/weather/components/PrimaryWeatherCard';
import { HourlyScroll } from '../features/weather/components/HourlyScroll';
import { FiveDayForecast } from '../features/weather/components/FiveDayForecast';
import { UnitToggle } from '../components/unitToggle';
import { SearchBar } from '../features/search/components/SearchBar';
import { BackgroundManager } from '../components/layout/BackgroundManager';
import { StaleIndicator } from '../components/StaleIndicator';
import { LoadingAnimation } from '../components/LoadingAnimation';
import { locationManager } from '../utils/locationManager';
import { City, Coordinates } from '../features/weather/model/types';
import { IconButton } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import { router } from 'expo-router';

export default function HomePage() {
  // Get navigation parameters
  const params = useLocalSearchParams();
  
  // Auth
  const { user, signOut } = useAuth();
  
  // State for active city and coordinates
  const [activeCity, setActiveCity] = useState<City | null>(null);
  const [coords, setCoords] = useState<Coordinates>({ lat: 48.8566, lon: 2.3522 }); // Default to Paris
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [hasTriedLocation, setHasTriedLocation] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{name: string; country: string; lat: number; lon: number}>>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Hooks
  const { data, error, isLoading } = useWeather(coords);
  const { searchCities, isLoading: searchLoading } = useCitySearch();

  // Handle navigation parameters from cities page
  useEffect(() => {
    if (params.lat && params.lon && params.cityName) {
      console.log('📍 Navigation parameters detected:', params);
      const newLat = parseFloat(Array.isArray(params.lat) ? params.lat[0] : params.lat);
      const newLon = parseFloat(Array.isArray(params.lon) ? params.lon[0] : params.lon);
      
      // Only update if coordinates are actually different to prevent infinite loops
      if (coords.lat !== newLat || coords.lon !== newLon) {
        const paramCity: City = {
          name: Array.isArray(params.cityName) ? params.cityName[0] : params.cityName,
          country: Array.isArray(params.country) ? params.country[0] : (params.country || 'Unknown'),
          lat: newLat,
          lon: newLon,
        };
        
        console.log('🎯 Setting city from navigation:', paramCity);
        console.log('🎯 Setting coordinates:', { lat: paramCity.lat, lon: paramCity.lon });
        setActiveCity(paramCity);
        setCoords({ lat: paramCity.lat, lon: paramCity.lon });
        setHasTriedLocation(true); // Skip location detection
      }
    } else {
      console.log('📍 No navigation parameters detected');
    }
  }, [params.lat, params.lon, params.cityName, params.country]);

  // Try to get user location on app start
  useEffect(() => {
    // Skip location detection if we have navigation parameters
    if (params.lat && params.lon) {
      setHasTriedLocation(true);
      return;
    }
    
    const tryGetUserLocation = async () => {
      if (hasTriedLocation) return;
      
      setIsDetectingLocation(true);
      try {
        const userLocation = await locationManager.getUserLocation();
        if (userLocation) {
          setActiveCity(userLocation);
          setCoords({ lat: userLocation.lat, lon: userLocation.lon });
        }
      } catch (error) {
        console.log('Failed to get user location on startup:', error);
      } finally {
        setIsDetectingLocation(false);
        setHasTriedLocation(true);
      }
    };

    tryGetUserLocation();
  }, [hasTriedLocation, params.lat, params.lon]);

  // Handle manual location detection
  const handleGetLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const userLocation = await locationManager.refreshLocation();
      if (userLocation) {
        setActiveCity(userLocation);
        setCoords({ lat: userLocation.lat, lon: userLocation.lon });
        Alert.alert('Location Found', `Using your current location: ${userLocation.name}`);
      } else {
        Alert.alert(
          'Location Unavailable', 
          'Could not detect your location. Please ensure location services are enabled and try again.'
        );
      }
    } catch (error) {
      console.error('Location detection error:', error);
      Alert.alert('Location Error', 'Failed to detect your location. Please try again.');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Handle city search
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    try {
      const cities = await searchCities(query);
      setSearchResults(cities);
      setShowSearchResults(cities.length > 0);
      
      if (cities.length === 0) {
        Alert.alert('No Results', 'No cities found for your search');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Could not search for cities');
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Handle search text change (for real-time search)
  const handleSearchTextChange = (text: string) => {
    if (!text.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Handle city selection from search results
  const handleCitySelect = (city: {name: string; country: string; lat: number; lon: number}) => {
    const selectedCity: City = {
      name: city.name,
      country: city.country,
      lat: city.lat,
      lon: city.lon,
    };
    setActiveCity(selectedCity);
    setCoords({ lat: city.lat, lon: city.lon });
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Get display city (either searched city or from weather data)
  const displayCity = activeCity || (data?.city ? {
    name: data.city.name,
    country: data.city.country,
    lat: data.city.lat,
    lon: data.city.lon,
  } : {
    name: 'Paris',
    country: 'France',
    lat: 48.8566,
    lon: 2.3522,
  });

  if (isLoading || isDetectingLocation) {
    return (
      <BackgroundManager weatherCode={0}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LoadingAnimation 
          message={isDetectingLocation ? "Detecting your location..." : "Loading weather data..."} 
        />
      </BackgroundManager>
    );
  }

  if (error) {
    return (
      <BackgroundManager weatherCode={0}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.centerContainer}>
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>Weather Unavailable</Text>
            <Text style={styles.errorDetail}>
              Unable to load weather data. Please check your internet connection and try again.
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                // Force refetch by toggling coordinates slightly
                setCoords(prev => ({ lat: prev.lat + 0.0001, lon: prev.lon + 0.0001 }));
                setTimeout(() => setCoords(prev => ({ lat: prev.lat - 0.0001, lon: prev.lon - 0.0001 })), 100);
              }}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BackgroundManager>
    );
  }

  if (!data) {
    return (
      <BackgroundManager weatherCode={0}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>No weather data available.</Text>
        </View>
      </BackgroundManager>
    );
  }

  return (
    <BackgroundManager 
      weatherCode={data?.current?.weatherCode || 0}
      sunrise={data?.current?.sunrise}
      sunset={data?.current?.sunset}
      cityTimezone={data?.city?.timezone}
      cityUtcOffset={data?.city?.utcOffset}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <IconButton 
            icon="crosshairs-gps" 
            iconColor="rgba(255,255,255,0.9)"
            size={24}
            onPress={handleGetLocation}
            loading={isDetectingLocation}
            disabled={isDetectingLocation}
            style={styles.locationButton}
          />
          <View style={styles.headerRight}>
            <UnitToggle />
            {user ? (
              <IconButton 
                icon="account-circle" 
                iconColor="rgba(255,255,255,0.9)"
                size={24}
                onPress={signOut}
                style={styles.authButton}
              />
            ) : (
              <IconButton 
                icon="login" 
                iconColor="rgba(255,255,255,0.9)"
                size={24}
                onPress={() => router.push('/(auth)/welcome')}
                style={styles.authButton}
              />
            )}
          </View>
        </View>
        
      <View style={styles.searchContainer}>
        <SearchBar 
          onSearch={handleSearch} 
          onTextChange={handleSearchTextChange}
        />
        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
            <View style={styles.searchResultsContainer}>
              <FlatList
                data={searchResults}
                keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => handleCitySelect(item)}
                  >
                    <Text style={styles.cityName}>{item.name || 'Unknown City'}</Text>
                    <Text style={styles.countryName}>{item.country || 'Unknown Country'}</Text>
                  </TouchableOpacity>
                )}
                style={styles.searchResultsList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </View>

        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <StaleIndicator lastUpdated={Date.now() / 1000} staleThresholdMinutes={15} />
          <PrimaryWeatherCard city={displayCity} current={data.current} />
          <HourlyScroll hourly={data.hourly} />
          <FiveDayForecast daily={data.daily} />
        </ScrollView>
      </View>
    </BackgroundManager>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
  },
  locationButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    marginLeft: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 50,
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    textAlign: 'center',
  },
  errorCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 28,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  searchResultsContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  searchResultsList: {
    maxHeight: 200,
  },
  searchResultItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  cityName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  countryName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 2,
  },
});