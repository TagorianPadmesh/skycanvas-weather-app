import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';

interface StaleIndicatorProps {
  lastUpdated: number; // Unix timestamp
  staleThresholdMinutes?: number;
}

export function StaleIndicator({ lastUpdated, staleThresholdMinutes = 60 }: StaleIndicatorProps) {
  const now = Date.now() / 1000;
  const ageMinutes = Math.floor((now - lastUpdated) / 60);
  const isStale = ageMinutes > staleThresholdMinutes;
  
  if (!isStale) {
    return null;
  }
  
  const getAgeText = () => {
    if (ageMinutes < 60) {
      return `${ageMinutes}m ago`;
    }
    
    const ageHours = Math.floor(ageMinutes / 60);
    if (ageHours < 24) {
      return `${ageHours}h ago`;
    }
    
    const ageDays = Math.floor(ageHours / 24);
    return `${ageDays}d ago`;
  };
  
  return (
    <View style={styles.container}>
      <Chip 
        icon="clock-outline" 
        mode="outlined"
        textStyle={styles.chipText}
        style={styles.chip}
      >
        Data {getAgeText()}
      </Chip>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 8,
  },
  chip: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderColor: '#ffc107',
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
});