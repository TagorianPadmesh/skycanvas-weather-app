import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, StatusBar, FlatList, Alert, Platform, TouchableWithoutFeedback } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { useCitySearch } from '../features/search/hooks/useCitySearch';
import { useWeather } from '../features/weather/hooks/useWeather';
import { City } from '../features/weather/model/types';
import { storage } from '../utils/storage';
import { locationManager } from '../utils/locationManager';

// Remove default cities - we'll only show saved cities and user location
const defaultCities: City[] = [];

interface WeatherCardProps {
  city: City;
  isMyLocation?: boolean;
  onPress: () => void;
  onRemove?: () => void;
  showRemove?: boolean;
}

const WeatherCard = ({ city, isMyLocation = false, onPress, onRemove, showRemove = false }: WeatherCardProps) => {
  const { data: weather } = useWeather({ lat: city.lat, lon: city.lon });
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  
  console.log('WeatherCard rendering for city:', city.name, 'isMyLocation:', isMyLocation);
  
  // Live updating time
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  const timeString = useMemo(() => {
    return currentTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }, [currentTime]);

  // Get local time for the city based on coordinates (simplified approach)
  const getCityTime = useCallback(() => {
    // For other cities, we'll use a simplified timezone offset calculation
    // This is a basic approach - for production, you'd want to use a proper timezone API
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    
    // Rough longitude-based timezone calculation (15 degrees = 1 hour)
    const timezoneOffset = Math.round(city.lon / 15);
    const cityTime = new Date(utc + (timezoneOffset * 3600000));
    
    return cityTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit', 
      hour12: false
    });
  }, [city.lon]);

  const cityTimeString = useMemo(() => {
    return getCityTime();
  }, [getCityTime, currentTime]); // Update when currentTime changes

  const temp = weather ? Math.round(weather.current.tempC) : '--';
  const high = weather ? Math.round(weather.current.tempC + 3) : '--';
  const low = weather ? Math.round(weather.current.tempC - 8) : '--';
  const description = weather?.current.weatherDescription || 'Loading...';

  const handleLongPress = useCallback(() => {
    if (showRemove && onRemove && !isMyLocation) {
      Alert.alert(
        'Remove City',
        `Remove ${city.name} from your saved cities?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive',
            onPress: onRemove
          }
        ]
      );
    }
  }, [showRemove, onRemove, isMyLocation, city.name]);

  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  // Enhanced gradient colors with more weather condition banners
  const gradientColors = useMemo(() => {
    if (!weather) return ['#87CEEB', '#6BB6FF'];
    
    const weatherCode = weather.current.weatherCode;
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 18;
    
    if (isNight) {
      // Night gradients based on weather
      if (weatherCode === 0 || weatherCode === 1) {
        return ['#2C3E50', '#34495E', '#4A6741']; // Clear night
      } else if ([2, 3].includes(weatherCode)) {
        return ['#34495E', '#2C3E50', '#1B2631']; // Cloudy night
      } else if ([51, 53, 55, 61, 63, 65].includes(weatherCode)) {
        return ['#2C3E50', '#34495E', '#273746']; // Rainy night
      } else if ([71, 73, 75, 77].includes(weatherCode)) {
        return ['#5D6D7E', '#34495E', '#2C3E50']; // Snowy night
      } else if ([95, 96, 99].includes(weatherCode)) {
        return ['#1B2631', '#2C3E50', '#34495E']; // Thunderstorm night
      }
      return ['#2C3E50', '#34495E', '#4A6741'];
    }
    
    // Day gradients based on weather with enhanced banners
    if (weatherCode === 0 || weatherCode === 1) {
      return ['#FFD700', '#FFA500', '#FF8C00']; // Sunny/Clear
    } else if ([2, 3].includes(weatherCode)) {
      return ['#BDC3C7', '#95A5A6', '#7F8C8D']; // Partly cloudy/Cloudy
    } else if ([45, 48].includes(weatherCode)) {
      return ['#95A5A6', '#7F8C8D', '#6C7B7F']; // Foggy
    } else if ([51, 53, 55, 56, 57].includes(weatherCode)) {
      return ['#85C1E9', '#5DADE2', '#3498DB']; // Drizzle
    } else if ([61, 63, 65, 66, 67].includes(weatherCode)) {
      return ['#5D6D7E', '#85929E', '#AEB6BF']; // Rain
    } else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
      return ['#E8F4FD', '#D5E8F7', '#C3E0F1']; // Snow
    } else if ([80, 81, 82].includes(weatherCode)) {
      return ['#4A6741', '#5D6D7E', '#85929E']; // Rain showers
    } else if ([95, 96, 99].includes(weatherCode)) {
      return ['#34495E', '#2C3E50', '#1B2631']; // Thunderstorm
    }
    
    return ['#87CEEB', '#6BB6FF']; // Default
  }, [weather]);

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      onLongPress={handleLongPress}
      delayLongPress={600}
      style={styles.cardContainer}
    >
      <LinearGradient
        colors={gradientColors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.weatherCard}
      >
        <View style={styles.cardContent}>
          <View style={styles.leftContent}>
            <Text style={styles.cityName}>
              {city.name || 'Unknown City'}
            </Text>
            <Text style={styles.timeText}>{cityTimeString}</Text>
            <Text style={styles.weatherDescription}>{description}</Text>
            {showRemove && !isMyLocation && (
              <Text style={styles.longPressHint}>Long press to remove</Text>
            )}
          </View>
          
          <View style={styles.rightContent}>
            <View style={styles.temperatureContainer}>
              <Text style={styles.temperature}>{temp}°</Text>
            </View>
            <Text style={styles.highLow}>H:{high}° L:{low}°</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function CitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [savedCities, setSavedCities] = useState<City[]>([]);
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [userLocation, setUserLocation] = useState<City | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<any>(null);
  const { searchCities, isLoading: searchApiLoading } = useCitySearch();

  // Load saved cities from storage
  useEffect(() => {
    loadSavedCities();
  }, []);

  const loadSavedCities = useCallback(async () => {
    console.log('\n=== LOADING SAVED CITIES ==>');
    try {
      const cities = await storage.getSavedCities();
      console.log('Loaded cities from storage:', cities);
      console.log('Number of cities loaded:', cities.length);
      setSavedCities(cities);
      console.log('=== CITIES LOADED SUCCESSFULLY ===\n');
    } catch (error) {
      console.error('❌ Error loading saved cities:', error);
      setSavedCities([]); // Set empty array as fallback
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Get user's location from cache or detect once
  useEffect(() => {
    (async () => {
      try {
        setIsLoadingLocation(true);
        console.log('🔄 Getting user location from location manager...');
        
        const userLocation = await locationManager.getUserLocation();
        
        if (userLocation) {
          console.log('✅ User location retrieved:', userLocation.name);
          setUserLocation(userLocation);
        } else {
          console.log('⚠️ No user location available');
          setUserLocation(null);
        }
      } catch (error) {
        console.log('⚠️ Location manager error:', error);
        setUserLocation(null);
      } finally {
        setIsLoadingLocation(false);
        console.log('🏁 Location loading completed');
      }
    })();
  }, []);

  const handleSearch = useCallback((query: string) => {
    console.log('Search triggered with query:', query);
    setSearchQuery(query);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.trim().length > 2) {
      console.log('Query length > 2, searching...');
      setIsSearching(true);
      // Debounce the search API call
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          console.log('Making API call for:', query);
          const results = await searchCities(query);
          console.log('Search results received:', results);
          if (results && results.length > 0) {
            console.log('Setting search results:', results.slice(0, 8));
            setSearchResults(results.slice(0, 8)); // Limit to 8 results for dropdown
            setShowSearchResults(true);
          } else {
            console.log('No results found for query:', query);
            setSearchResults([]);
            setShowSearchResults(false);
            // Show user feedback for no results only for longer queries
            if (query.trim().length > 4) {
              Alert.alert('No Results', `No cities found for "${query}". Try a different search term.`);
            }
          }
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
          setShowSearchResults(false);
          Alert.alert('Search Error', 'Unable to search cities. Please check your internet connection and try again.');
        } finally {
          setIsSearching(false);
        }
      }, 300); // 300ms debounce
    } else {
      console.log('Query too short, clearing results');
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);
    }
  }, [searchCities]);

  const addCityToSaved = useCallback(async (city: City) => {
    console.log('\n=== ADDING CITY TO SAVED ==>');
    console.log('City to add:', city);
    
    try {
      console.log('Step 1: Getting existing cities from storage...');
      const existingCities = await storage.getSavedCities();
      console.log('Existing cities count:', existingCities.length);
      console.log('Existing cities:', existingCities);
      
      // Check if city already exists
      const exists = existingCities.some(
        (existingCity) => 
          Math.abs(existingCity.lat - city.lat) < 0.01 && 
          Math.abs(existingCity.lon - city.lon) < 0.01
      );
      
      if (exists) {
        console.log('City already exists, showing alert');
        Alert.alert('🔍 Already Added', `${city.name} is already in your cities list`, [{ text: 'OK' }]);
        return;
      }
      
      console.log('Step 2: City is new, adding to storage...');
      await storage.addSavedCity(city);
      console.log('Step 3: City added to storage, refreshing list...');
      
      await loadSavedCities(); // Refresh the list
      console.log('Step 4: List refreshed, clearing search...');
      
      setSearchQuery('');
      setSearchResults([]);
      setShowSearchResults(false);
      
      console.log('Step 5: Search cleared, city addition completed successfully');
      console.log('=== CITY ADDITION COMPLETE ===\n');
      
      // Toast-like feedback instead of alert
      Alert.alert('✅ Success', `${city.name} added to your cities`, [{ text: 'OK' }]);
    } catch (error) {
      console.error('❌ Error adding city:', error);
      Alert.alert('❌ Error', `Failed to add ${city.name} to your list. Error: ${error}`, [{ text: 'OK' }]);
    }
  }, [loadSavedCities]);

  const navigateToWeather = useCallback((city: City, useLocation: boolean) => {
    console.log('\n=== NAVIGATING TO WEATHER SCREEN ==>');
    console.log('City:', city.name);
    console.log('Use Location:', useLocation);
    console.log('Coordinates:', { lat: city.lat, lon: city.lon });
    
    try {
      router.push({
        pathname: '/',
        params: {
          useLocation: useLocation.toString(),
          cityName: city.name,
          country: city.country,
          lat: city.lat.toString(),
          lon: city.lon.toString()
        }
      });
      console.log('✅ Navigation initiated successfully');
      console.log('=== NAVIGATION COMPLETE ===\n');
    } catch (error) {
      console.error('❌ Navigation failed:', error);
      Alert.alert('Navigation Error', 'Failed to navigate to weather screen', [{ text: 'OK' }]);
    }
  }, []);

  const handleSearchResultPress = useCallback((city: City) => {
    console.log('Search result pressed:', city);
    // Always show confirmation before adding
    Alert.alert(
      'Add City',
      `Add ${city.name} to your saved cities?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add', 
          onPress: () => {
            console.log('User chose to add city');
            addCityToSaved(city);
          },
          style: 'default'
        },
        {
          text: 'View Weather',
          onPress: () => {
            console.log('User chose to view weather');
            navigateToWeather(city, false);
          },
          style: 'default'
        }
      ]
    );
  }, [addCityToSaved, navigateToWeather]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setShowSearchResults(false);
    setSearchResults([]);
  }, []);

  const handleMyLocationPress = useCallback(() => {
    if (userLocation) {
      navigateToWeather(userLocation, true);
    }
  }, [userLocation, navigateToWeather]);

  const handleCityPress = useCallback((city: City) => {
    navigateToWeather(city, false);
  }, [navigateToWeather]);

  const removeCityFromSaved = useCallback(async (city: City) => {
    console.log('\n=== REMOVING CITY FROM SAVED ==>');
    console.log('City to remove:', city);
    
    try {
      await storage.removeSavedCity(city);
      console.log('City removed from storage, refreshing list...');
      
      await loadSavedCities(); // Refresh the list
      console.log('List refreshed successfully');
      console.log('=== CITY REMOVAL COMPLETE ===\n');
      
      Alert.alert('✅ Removed', `${city.name} removed from your cities`, [{ text: 'OK' }]);
    } catch (error) {
      console.error('❌ Error removing city:', error);
      Alert.alert('❌ Error', `Failed to remove ${city.name}. Error: ${error}`, [{ text: 'OK' }]);
    }
  }, [loadSavedCities]);

  const handleAddCityPress = useCallback(async () => {
    // Enhanced debugging for add city functionality
    console.log('\n=== TESTING CITY SEARCH SYSTEM ==>');
    
    // Test the search API directly
    try {
      console.log('Testing search API with "London"...');
      const testResults = await searchCities('London');
      console.log('Test search results:', testResults);
      
      if (testResults && testResults.length > 0) {
        console.log('✅ Search API is working!');
        Alert.alert(
          '🎆 Add Cities',
          'Search API is working! Use the search bar below to find and add cities to your list.',
          [{ text: 'Got it!' }]
        );
      } else {
        console.log('❌ Search API returned empty results');
        Alert.alert(
          '⚠️ API Issue',
          'The city search API seems to be having issues. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Search API test failed:', error);
      Alert.alert(
        '❌ Connection Error',
        `Cannot connect to city search service. Error: ${(error as Error).message}`,
        [{ text: 'OK' }]
      );
    }
    
    console.log('=== CITY SEARCH TEST COMPLETE ===\n');
  }, [searchCities]);

  // Add function to refresh location manually (optional)
  const handleRefreshLocation = useCallback(async () => {
    Alert.alert(
      'Refresh Location',
      'This will detect your current location again. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refresh',
          onPress: async () => {
            setIsLoadingLocation(true);
            try {
              const refreshedLocation = await locationManager.refreshLocation();
              if (refreshedLocation) {
                setUserLocation(refreshedLocation);
                Alert.alert('✅ Success', `Location updated to ${refreshedLocation.name}`);
              } else {
                Alert.alert('⚠️ Failed', 'Could not detect your location. Please check permissions.');
              }
            } catch (error) {
              Alert.alert('❌ Error', 'Failed to refresh location');
            } finally {
              setIsLoadingLocation(false);
            }
          },
        },
      ]
    );
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Weather</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <IconButton icon="magnify" iconColor="rgba(255,255,255,0.6)" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cities to add or view weather"
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch}>
              <IconButton icon="close" iconColor="rgba(255,255,255,0.6)" size={20} />
            </TouchableOpacity>
          ) : isSearching ? (
            <IconButton icon="loading" iconColor="rgba(255,255,255,0.6)" size={20} />
          ) : (
            <View style={styles.searchSpacer} />
          )}
        </View>
        
        {/* Search Results Dropdown */}
        {(showSearchResults || isSearching) && (
          <View style={styles.searchDropdown}>
            {isSearching ? (
              <View style={styles.loadingSearchContainer}>
                <Text style={styles.loadingSearchText}>🔍 Searching for cities...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                keyExtractor={(item, index) => `${item.name}-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => handleSearchResultPress(item)}
                  >
                    <View style={styles.searchResultContent}>
                      <Text style={styles.searchResultCity}>{item.name}</Text>
                      <Text style={styles.searchResultCountry}>{item.country}</Text>
                    </View>
                    <IconButton icon="plus-circle-outline" iconColor="rgba(255,255,255,0.6)" size={16} />
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                style={styles.searchResultsList}
              />
            ) : (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>No cities found. Try a different search term.</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Cities List */}
      <ScrollView 
        style={styles.citiesList}
        contentContainerStyle={styles.citiesContent}
        showsVerticalScrollIndicator={false}
      >
        {/* My Location Card */}
        {isLoadingLocation ? (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>🔍 Loading your location...</Text>
            <Text style={styles.loadingSubtext}>Using cached location if available</Text>
          </View>
        ) : userLocation && !showSearchResults ? (
          <WeatherCard
            city={userLocation}
            isMyLocation={true}
            onPress={handleMyLocationPress}
          />
        ) : (!isLoadingLocation && !userLocation && !showSearchResults) ? (
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>🌤️ Welcome to Weather App</Text>
            <Text style={styles.welcomeText}>
              Search for your city above to get started with local weather forecasts
            </Text>
            <Text style={styles.welcomeSubtext}>
              Enable location permissions to see your local weather automatically
            </Text>
            <TouchableOpacity onPress={handleRefreshLocation} style={styles.refreshButton}>
              <Text style={styles.refreshButtonText}>📍 Try Location Again</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Saved Cities */}
        {!showSearchResults && savedCities.map((city, index) => (
          <WeatherCard
            key={`${city.name}-${city.lat}-${city.lon}`}
            city={city}
            onPress={() => handleCityPress(city)}
            onRemove={() => removeCityFromSaved(city)}
            showRemove={true}
          />
        ))}

        {/* Empty state when no saved cities */}
        {!showSearchResults && savedCities.length === 0 && !isLoadingLocation && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              🌆 Search for cities above to add them to your list
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Added cities will appear here for quick access
            </Text>
          </View>
        )}
      </ScrollView>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter',
    paddingVertical: 12,
  },
  searchSpacer: {
    width: 40,
    height: 40,
  },
  searchDropdown: {
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchResultsList: {
    maxHeight: 300,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultCity: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  searchResultCountry: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  citiesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  citiesContent: {
    paddingBottom: 100,
  },
  cardContainer: {
    marginBottom: 12,
  },
  weatherCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  leftContent: {
    flex: 1,
  },
  cityName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600', // Increased weight for better visibility
    fontFamily: 'Inter',
    marginBottom: 4,
    opacity: 1,
    zIndex: 10,
  },
  timeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  weatherDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontFamily: 'Inter',
  },
  longPressHint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontFamily: 'Inter',
    fontStyle: 'italic',
    marginTop: 4,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  temperature: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '300', // Light weight as per memory specs
    fontFamily: 'Inter',
    lineHeight: 52,
  },
  highLow: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500', // Medium weight as per memory specs
    fontFamily: 'Inter',
    marginTop: 4,
  },

  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'Inter',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  loadingCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontFamily: 'Inter',
  },
  loadingSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontFamily: 'Inter',
    marginTop: 4,
  },
  welcomeCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 12,
    alignItems: 'center',
  },
  welcomeTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Inter',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontFamily: 'Inter',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  welcomeSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontFamily: 'Inter',
    textAlign: 'center',
    lineHeight: 20,
  },

  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  loadingSearchContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingSearchText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: 'Inter',
    textAlign: 'center',
  },
});