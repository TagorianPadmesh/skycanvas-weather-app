import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';

interface LoadingAnimationProps {
  message?: string;
}

export function LoadingAnimation({ message = "Loading weather data..." }: LoadingAnimationProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Scale animation
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Continuous rotation
    const rotationLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000, // Faster rotation for perceived speed
        useNativeDriver: true,
      })
    );

    rotationLoop.start();

    return () => {
      rotationLoop.stop();
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      {/* Simple rotating ring */}
      <Animated.View style={[styles.loadingRing, { transform: [{ rotate: spin }] }]} />
      
      {/* Loading text */}
      <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
        <Text style={styles.loadingText}>{message}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 100,
  },
  loadingRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    borderTopColor: 'rgba(255,255,255,0.9)',
    borderRightColor: 'rgba(255,255,255,0.9)',
    marginBottom: 30,
  },
  textContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});