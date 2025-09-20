import React, { useRef, useEffect, useState } from 'react';
import { Animated, StyleSheet, Dimensions, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { weatherGradients, getGradientKey } from '../../theme/gradients';

interface BackgroundManagerProps {
  weatherCode?: number;
  sunrise?: number; // Unix timestamp
  sunset?: number;  // Unix timestamp
  cityTimezone?: string; // IANA timezone name (e.g., "America/New_York")
  cityUtcOffset?: number; // UTC offset in seconds
  children: React.ReactNode;
}

// Animation components for different weather conditions
const RainAnimation = () => {
  const rainDrops = useRef(
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      animValue: new Animated.Value(0),
      left: Math.random() * Dimensions.get('window').width,
      delay: Math.random() * 2000,
    }))
  ).current;

  useEffect(() => {
    const animations = rainDrops.map((drop) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(drop.delay),
          Animated.timing(drop.animValue, {
            toValue: 1,
            duration: 1000 + Math.random() * 500,
            useNativeDriver: true,
          }),
          Animated.timing(drop.animValue, {
            toValue: 0,
            duration: 0, // Reset immediately
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 } // Infinite loop
      );
    });

    animations.forEach(anim => anim.start());

    return () => animations.forEach(anim => anim.stop());
  }, []);

  return (
    <View style={styles.animationContainer}>
      {rainDrops.map((drop) => (
        <Animated.View
          key={drop.id}
          style={[
            styles.rainDrop,
            {
              left: drop.left,
              transform: [
                {
                  translateY: drop.animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, Dimensions.get('window').height + 20],
                  }),
                },
              ],
              opacity: drop.animValue.interpolate({
                inputRange: [0, 0.1, 0.9, 1],
                outputRange: [0, 0.8, 0.8, 0],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
};

const SnowAnimation = () => {
  const snowFlakes = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      animValue: new Animated.Value(0),
      left: Math.random() * Dimensions.get('window').width,
      delay: Math.random() * 3000,
      size: 3 + Math.random() * 4,
    }))
  ).current;

  useEffect(() => {
    const animations = snowFlakes.map((flake) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(flake.delay),
          Animated.timing(flake.animValue, {
            toValue: 1,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(flake.animValue, {
            toValue: 0,
            duration: 0, // Reset immediately
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 } // Infinite loop
      );
    });

    animations.forEach(anim => anim.start());

    return () => animations.forEach(anim => anim.stop());
  }, []);

  return (
    <View style={styles.animationContainer}>
      {snowFlakes.map((flake) => (
        <Animated.View
          key={flake.id}
          style={[
            styles.snowFlake,
            {
              left: flake.left,
              width: flake.size,
              height: flake.size,
              borderRadius: flake.size / 2,
              transform: [
                {
                  translateY: flake.animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, Dimensions.get('window').height + 20],
                  }),
                },
                {
                  translateX: flake.animValue.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 20, -10],
                  }),
                },
              ],
              opacity: flake.animValue.interpolate({
                inputRange: [0, 0.1, 0.9, 1],
                outputRange: [0, 0.9, 0.9, 0],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
};

const CloudsAnimation = () => {
  const clouds = useRef(
    Array.from({ length: 4 }, (_, i) => ({
      id: i,
      animValue: new Animated.Value(0),
      top: 50 + i * 80 + Math.random() * 40,
      delay: i * 1000,
      scale: 0.8 + Math.random() * 0.4,
    }))
  ).current;

  useEffect(() => {
    const animations = clouds.map((cloud) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(cloud.delay),
          Animated.timing(cloud.animValue, {
            toValue: 1,
            duration: 8000 + Math.random() * 4000,
            useNativeDriver: true,
          }),
          Animated.timing(cloud.animValue, {
            toValue: 0,
            duration: 0, // Reset immediately
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 } // Infinite loop
      );
    });

    animations.forEach(anim => anim.start());

    return () => animations.forEach(anim => anim.stop());
  }, []);

  return (
    <View style={styles.animationContainer}>
      {clouds.map((cloud) => (
        <Animated.View
          key={cloud.id}
          style={[
            styles.cloud,
            {
              top: cloud.top,
              transform: [
                {
                  translateX: cloud.animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-200, Dimensions.get('window').width + 100],
                  }),
                },
                { scale: cloud.scale },
              ],
              opacity: cloud.animValue.interpolate({
                inputRange: [0, 0.1, 0.9, 1],
                outputRange: [0, 0.6, 0.6, 0],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
};

const StarsAnimation = () => {
  const stars = useRef(
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      animValue: new Animated.Value(0),
      left: Math.random() * Dimensions.get('window').width,
      top: Math.random() * (Dimensions.get('window').height * 0.6), // Only upper 60% of screen
      delay: Math.random() * 5000,
      size: 1 + Math.random() * 2,
      twinkleSpeed: 2000 + Math.random() * 3000,
    }))
  ).current;

  useEffect(() => {
    const animations = stars.map((star) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(star.delay),
          Animated.timing(star.animValue, {
            toValue: 1,
            duration: star.twinkleSpeed,
            useNativeDriver: true,
          }),
          Animated.timing(star.animValue, {
            toValue: 0.3,
            duration: star.twinkleSpeed,
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 } // Infinite loop
      );
    });

    animations.forEach(anim => anim.start());

    return () => animations.forEach(anim => anim.stop());
  }, []);

  return (
    <View style={styles.animationContainer}>
      {stars.map((star) => (
        <Animated.View
          key={star.id}
          style={[
            styles.star,
            {
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
              opacity: star.animValue,
            },
          ]}
        />
      ))}
    </View>
  );
};

const MoonAnimation = () => {
  const moonGlow = useRef(new Animated.Value(0.8)).current;
  const moonPhase = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Gentle pulsing glow effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(moonGlow, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(moonGlow, {
          toValue: 0.8,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 } // Infinite loop
    ).start();

    // Subtle phase animation
    Animated.loop(
      Animated.timing(moonPhase, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      }),
      { iterations: -1 } // Infinite loop
    ).start();
  }, []);

  return (
    <View style={styles.moonContainer}>
      {/* Moon glow */}
      <Animated.View
        style={[
          styles.moonGlow,
          {
            opacity: moonGlow,
            transform: [
              {
                scale: moonGlow.interpolate({
                  inputRange: [0.8, 1],
                  outputRange: [1, 1.05],
                }),
              },
            ],
          },
        ]}
      />
      {/* Moon core */}
      <Animated.View
        style={[
          styles.moonCore,
          {
            opacity: moonGlow.interpolate({
              inputRange: [0.8, 1],
              outputRange: [0.9, 1],
            }),
          },
        ]}
      />
      {/* Moon craters (aesthetic details) */}
      <View style={styles.moonCrater1} />
      <View style={styles.moonCrater2} />
      <View style={styles.moonCrater3} />
    </View>
  );
};

const ShootingStarsAnimation = () => {
  const shootingStars = useRef(
    Array.from({ length: 3 }, (_, i) => ({
      id: i,
      animValue: new Animated.Value(0),
      startX: Dimensions.get('window').width + 50,
      startY: 50 + Math.random() * 200,
      delay: Math.random() * 10000 + 5000, // Random delay between 5-15 seconds
      angle: 30 + Math.random() * 30, // Shooting angle
    }))
  ).current;

  useEffect(() => {
    const createShootingStar = (star: any) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(star.delay),
          Animated.timing(star.animValue, {
            toValue: 1,
            duration: 1500, // Fast shooting star
            useNativeDriver: true,
          }),
          Animated.timing(star.animValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.delay(8000 + Math.random() * 12000), // Wait 8-20 seconds before next
        ]),
        { iterations: -1 } // Infinite loop
      );
    };

    const animations = shootingStars.map(createShootingStar);
    animations.forEach(anim => anim.start());

    return () => animations.forEach(anim => anim.stop());
  }, []);

  return (
    <View style={styles.animationContainer}>
      {shootingStars.map((star) => (
        <Animated.View
          key={star.id}
          style={[
            styles.shootingStar,
            {
              left: star.startX,
              top: star.startY,
              transform: [
                {
                  translateX: star.animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -Dimensions.get('window').width - 100],
                  }),
                },
                {
                  translateY: star.animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, Dimensions.get('window').width * 0.4],
                  }),
                },
                {
                  rotate: `${star.angle}deg`,
                },
              ],
              opacity: star.animValue.interpolate({
                inputRange: [0, 0.1, 0.7, 1],
                outputRange: [0, 1, 1, 0],
              }),
            },
          ]}
        >
          {/* Star trail effect */}
          <View style={styles.shootingStarTrail} />
          <View style={styles.shootingStarCore} />
        </Animated.View>
      ))}
    </View>
  );
};

const ThunderstormAnimation = () => {
  const lightningAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createLightning = () => {
      Animated.sequence([
        Animated.timing(lightningAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(lightningAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.delay(100),
        Animated.timing(lightningAnim, {
          toValue: 0.8,
          duration: 50,
          useNativeDriver: false,
        }),
        Animated.timing(lightningAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: false,
        }),
        Animated.delay(3000 + Math.random() * 4000),
      ]).start(() => createLightning()); // Restart the sequence for continuous lightning
    };

    createLightning();
    
    return () => {
      lightningAnim.stopAnimation();
    };
  }, []);

  return (
    <>
      <RainAnimation />
      <Animated.View
        style={[
          styles.lightning,
          {
            opacity: lightningAnim,
          },
        ]}
      />
    </>
  );
};

export function BackgroundManager({ 
  weatherCode = 0, 
  sunrise, 
  sunset,
  cityTimezone,
  cityUtcOffset,
  children
}: BackgroundManagerProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const previousGradient = useRef<string[]>(weatherGradients.default);
  
  // Real-time update mechanism - update every minute
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute for real-time background changes
    
    return () => clearInterval(timer);
  }, []);
  
  // Get current time in the city's timezone
  const getCityCurrentTime = (): Date => {
    if (cityTimezone) {
      // Use IANA timezone name with Intl.DateTimeFormat for accurate timezone conversion
      try {
        const now = new Date();
        // Use Intl.DateTimeFormat for accurate timezone conversion
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: cityTimezone,
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: false
        });
        const parts = formatter.formatToParts(now);
        const dateObj: Record<string, string> = {};
        parts.forEach(part => {
          if (part.type !== 'literal') {
            dateObj[part.type] = part.value;
          }
        });
        return new Date(
          parseInt(dateObj.year),
          parseInt(dateObj.month) - 1, // Month is 0-indexed in JS Date
          parseInt(dateObj.day),
          parseInt(dateObj.hour),
          parseInt(dateObj.minute),
          parseInt(dateObj.second)
        );
      } catch (error) {
        console.warn('Invalid timezone, falling back to UTC offset:', cityTimezone, error);
      }
    }
    
    if (cityUtcOffset !== undefined) {
      // Fallback: Use UTC offset for timezone conversion
      // Note: We need to subtract the offset because we're converting from UTC to local time
      const now = new Date();
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const cityTime = new Date(utcTime - (cityUtcOffset * 1000));
      return cityTime;
    }
    
    // Final fallback: use local time
    return new Date();
  };
  
  // Enhanced time detection with dawn/evening support using city's timezone
  const getDetailedTimeOfDay = () => {
    const cityTime = getCityCurrentTime();
    
    if (!sunrise || !sunset) {
      const hour = cityTime.getHours();
      if (hour >= 5 && hour <= 7) return 'dawn';
      if (hour >= 8 && hour <= 17) return 'day';
      if (hour >= 18 && hour <= 20) return 'evening';
      return 'night';
    }
    
    const currentHour = cityTime.getHours();
    const currentMinutes = cityTime.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinutes;
    
    // Convert sunrise/sunset times to city timezone
    // Note: OpenMeteo API already returns sunrise/sunset in local timezone, so we just need to parse them
    const sunriseDate = new Date(sunrise * 1000);
    const sunsetDate = new Date(sunset * 1000);
    
    const sunriseMinutes = sunriseDate.getHours() * 60 + sunriseDate.getMinutes();
    const sunsetMinutes = sunsetDate.getHours() * 60 + sunsetDate.getMinutes();
    
    // Dawn: 1 hour before sunrise to 1 hour after sunrise
    const dawnStart = sunriseMinutes - 60;
    const dawnEnd = sunriseMinutes + 60;
    
    // Evening: 1 hour before sunset to 1 hour after sunset
    const eveningStart = sunsetMinutes - 60;
    const eveningEnd = sunsetMinutes + 60;
    
    if (currentTimeInMinutes >= dawnStart && currentTimeInMinutes <= dawnEnd) {
      return 'dawn';
    } else if (currentTimeInMinutes >= eveningStart && currentTimeInMinutes <= eveningEnd) {
      return 'evening';
    } else if (currentTimeInMinutes > dawnEnd && currentTimeInMinutes < eveningStart) {
      return 'day';
    } else {
      return 'night';
    }
  };
  
  // Determine if it's day or night with city's timezone
  const isDay = () => {
    const cityTime = getCityCurrentTime();
    
    if (!sunrise || !sunset) {
      // Fallback to time-based detection if no sun times available
      const hour = cityTime.getHours();
      return hour >= 6 && hour < 18;
    }
    
    // Convert sunrise/sunset times to city timezone
    // Note: OpenMeteo API already returns sunrise/sunset in local timezone, so we just need to parse them
    const sunriseDate = new Date(sunrise * 1000);
    const sunsetDate = new Date(sunset * 1000);
    
    const now = cityTime.getTime() / 1000; // Use city time
    const sunriseTime = sunriseDate.getTime() / 1000;
    const sunsetTime = sunsetDate.getTime() / 1000;
    
    // Add some buffer time for dawn/dusk (30 minutes)
    const dawnBuffer = 30 * 60; // 30 minutes in seconds
    const duskBuffer = 30 * 60; // 30 minutes in seconds
    
    return now >= (sunriseTime - dawnBuffer) && now <= (sunsetTime + duskBuffer);
  };
  
  const detailedTimeOfDay = getDetailedTimeOfDay();
  const currentGradientKey = getGradientKey(
    weatherCode, 
    isDay(), 
    sunrise, 
    sunset, 
    cityTimezone, 
    cityUtcOffset
  );
  const currentGradient = weatherGradients[currentGradientKey] || weatherGradients.default;
  
  console.log('🌍 Timezone-Aware Background Update:', {
    userLocalTime: new Date().toLocaleTimeString(),
    cityTimezone,
    cityUtcOffset,
    cityLocalTime: getCityCurrentTime().toLocaleTimeString(),
    detailedTimeOfDay,
    weatherCode,
    currentGradientKey,
    sunrise: sunrise ? new Date(sunrise * 1000).toLocaleTimeString() : 'N/A',
    sunset: sunset ? new Date(sunset * 1000).toLocaleTimeString() : 'N/A',
    sunriseInCityTz: sunrise ? (cityTimezone ? 
      (() => {
        try {
          const sunriseDate = new Date(sunrise * 1000);
          return sunriseDate.toLocaleTimeString('en-US', { timeZone: cityTimezone });
        } catch (e) {
          return new Date((sunrise + (cityUtcOffset || 0)) * 1000).toLocaleTimeString();
        }
      })() :
      new Date((sunrise + (cityUtcOffset || 0)) * 1000).toLocaleTimeString()) : 'N/A',
    sunsetInCityTz: sunset ? (cityTimezone ? 
      (() => {
        try {
          const sunsetDate = new Date(sunset * 1000);
          return sunsetDate.toLocaleTimeString('en-US', { timeZone: cityTimezone });
        } catch (e) {
          return new Date((sunset + (cityUtcOffset || 0)) * 1000).toLocaleTimeString();
        }
      })() :
      new Date((sunset + (cityUtcOffset || 0)) * 1000).toLocaleTimeString()) : 'N/A',
    availableWeatherTypes: Object.keys(weatherGradients).filter(key => 
      key.includes('_dawn') || key.includes('_day') || key.includes('_evening') || key.includes('_night')
    ).map(key => key.split('_')[0]).filter((v, i, a) => a.indexOf(v) === i)
  });
  
  // Check if we should show the sun effect (clear day conditions)
  const shouldShowSun = (detailedTimeOfDay === 'day') && (weatherCode === 0 || weatherCode === 1);
  
  // Enhanced night sky elements - show for all clear night conditions including partly cloudy
  const shouldShowNightSky = (detailedTimeOfDay === 'night') && (weatherCode === 0 || weatherCode === 1 || weatherCode === 2);
  const shouldShowMoon = shouldShowNightSky;
  const shouldShowShootingStars = (detailedTimeOfDay === 'night') && (weatherCode === 0 || weatherCode === 1); // Only for completely clear nights
  const shouldShowStars = shouldShowNightSky;
  
  // Determine which weather animation to show
  const getWeatherAnimation = () => {
    // Rain conditions
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
      return <RainAnimation />;
    }
    
    // Snow conditions  
    if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
      return <SnowAnimation />;
    }
    
    // Thunderstorm conditions
    if ([95, 96, 99].includes(weatherCode)) {
      return <ThunderstormAnimation />;
    }
    
    // Cloudy conditions
    if ([2, 3, 45, 48].includes(weatherCode)) {
      return <CloudsAnimation />;
    }
    
    return null;
  };
  
  // Animate gradient change when weather changes OR time changes
  useEffect(() => {
    const hasChanged = JSON.stringify(currentGradient) !== JSON.stringify(previousGradient.current);
    
    if (hasChanged) {
      // Fade out, change gradient, fade in
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
      
      previousGradient.current = currentGradient;
    }
  }, [currentGradient, fadeAnim, currentTime, weatherCode, sunrise, sunset, cityTimezone, cityUtcOffset]); // Added all relevant dependencies
  
  return (
    <>
      <Animated.View style={[styles.backgroundContainer, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={currentGradient as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        />
        
        {/* Weather Animations */}
        {getWeatherAnimation()}
        
        {/* Shining Sun Effect for Clear Day */}
        {shouldShowSun && (
          <View style={styles.sunContainer}>
            <View style={styles.sunGlow} />
            <View style={styles.sunCore} />
          </View>
        )}
        
        {/* Night Sky Elements for Clear Night */}
        {shouldShowMoon && (
          <MoonAnimation />
        )}
        
        {/* Stars Effect for Clear Night */}
        {shouldShowStars && (
          <StarsAnimation />
        )}
        
        {/* Shooting Stars for Clear Night */}
        {shouldShowShootingStars && (
          <ShootingStarsAnimation />
        )}
      </Animated.View>
      {children}
    </>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  gradient: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  animationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  rainDrop: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 1,
  },
  snowFlake: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  cloud: {
    position: 'absolute',
    width: 150,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 40,
    ...(Platform.OS !== 'web' ? {
      shadowColor: 'rgba(255, 255, 255, 0.5)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    } : {}),
  },
  lightning: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    zIndex: 3,
  },
  sunContainer: {
    position: 'absolute',
    top: 120,
    left: Dimensions.get('window').width * 0.15,
    width: Dimensions.get('window').width * 0.7,
    height: Dimensions.get('window').width * 0.7,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  sunGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: Dimensions.get('window').width * 0.35,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    ...(Platform.OS !== 'web' ? {
      shadowColor: '#ffffff',
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.9,
      shadowRadius: 120,
      elevation: 25,
    } : {}),
  },
  sunCore: {
    position: 'absolute',
    width: '30%',
    height: '30%',
    borderRadius: Dimensions.get('window').width * 0.105,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    ...(Platform.OS !== 'web' ? {
      shadowColor: '#ffffff',
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 1,
      shadowRadius: 60,
      elevation: 20,
    } : {}),
  },
  star: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    ...(Platform.OS !== 'web' ? {
      shadowColor: '#ffffff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
      elevation: 8,
    } : {}),
  },
  // Moon styles
  moonContainer: {
    position: 'absolute',
    top: 160, // Moved lower to avoid overlapping with search bar
    right: Dimensions.get('window').width * 0.15, // Moved slightly more to the right
    width: 70, // Slightly smaller
    height: 70, // Slightly smaller
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  moonGlow: {
    position: 'absolute',
    width: 70, // Adjusted to match container
    height: 70, // Adjusted to match container
    borderRadius: 35, // Adjusted radius
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    ...(Platform.OS !== 'web' ? {
      shadowColor: '#ffffff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 25,
      elevation: 15,
    } : {}),
  },
  moonCore: {
    position: 'absolute',
    width: 50, // Proportionally smaller
    height: 50, // Proportionally smaller
    borderRadius: 25, // Adjusted radius
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    ...(Platform.OS !== 'web' ? {
      shadowColor: '#ffffff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 15,
      elevation: 10,
    } : {}),
  },
  moonCrater1: {
    position: 'absolute',
    top: 15,
    left: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(200, 200, 200, 0.4)',
  },
  moonCrater2: {
    position: 'absolute',
    top: 35,
    left: 35,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
  },
  moonCrater3: {
    position: 'absolute',
    top: 25,
    left: 15,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(200, 200, 200, 0.35)',
  },
  // Shooting star styles
  shootingStar: {
    position: 'absolute',
    width: 40,
    height: 2,
    zIndex: 3,
  },
  shootingStarCore: {
    position: 'absolute',
    right: 0,
    width: 4,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: 1,
    ...(Platform.OS !== 'web' ? {
      shadowColor: '#ffffff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 15,
    } : {}),
  },
  shootingStarTrail: {
    position: 'absolute',
    left: 0,
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 1,
    ...(Platform.OS !== 'web' ? {
      shadowColor: '#ffffff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 6,
      elevation: 12,
    } : {}),
  },
});