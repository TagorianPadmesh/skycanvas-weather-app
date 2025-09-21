// components/SearchBar.tsx
import { View, StyleSheet, Platform, TextInput, TouchableOpacity, Animated } from "react-native";
import { IconButton } from "react-native-paper";
import { useState, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onTextChange?: (text: string) => void;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, onTextChange, isLoading = false }: SearchBarProps) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  
  const handleSubmit = () => {
    if (value.trim()) {
      onSearch(value.trim());
    }
  };
  
  const handleTextChange = (text: string) => {
    setValue(text);
    if (onTextChange) {
      onTextChange(text);
    }
  };
  
  const clearSearch = () => {
    setValue("");
    if (onTextChange) {
      onTextChange("");
    }
  };
  
  const handleFocus = () => {
    setIsFocused(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.02,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      {/* Backdrop blur effect */}
      <View style={styles.backdropBlur} />
      
      <LinearGradient
        colors={[
          isFocused ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.18)', 
          isFocused ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.12)', 
          isFocused ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)'
        ]} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.searchBarGradient,
          isFocused && styles.searchBarGradientFocused
        ]}
      >
        <View style={styles.searchBarContent}>
          <IconButton 
            icon="magnify" 
            iconColor={isFocused ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.8)"} // Subtle difference for focus
            size={20} // Standard size for better proportions
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Search for a city or airport"
            placeholderTextColor="rgba(255,255,255,0.7)" // Balanced visibility for glassmorphism
            value={value}
            onChangeText={handleTextChange}
            onSubmitEditing={handleSubmit}
            onFocus={handleFocus}
            onBlur={handleBlur}
            returnKeyType="search"
            autoCapitalize="words"
            autoCorrect={false}
            selectionColor="rgba(255,255,255,0.8)" // Consistent with theme
          />
          {value ? (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <IconButton 
                icon="close" 
                iconColor="rgba(255,255,255,0.8)" 
                size={20}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.spacer} />
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    marginVertical: 0,
    position: 'relative',
  },
  backdropBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.08)', // Subtle backdrop
    borderRadius: 24,
    zIndex: 1,
  },
  searchBarGradient: {
    borderRadius: 24, // Consistent with glassmorphism design specs
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)', // Soft white border as per specs
    overflow: 'hidden',
    position: 'relative',
    zIndex: 2,
    ...(Platform.OS !== 'web' ? {
      shadowColor: 'rgba(0,0,0,0.2)',
      shadowOffset: {
        width: 0,
        height: 12, // Enhanced shadows for depth as per specs
      },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 12,
    } : {
      // Web-specific shadow
      boxShadow: '0 12px 24px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.05)',
    }),
  },
  searchBarGradientFocused: {
    borderColor: 'rgba(255,255,255,0.6)',
    borderWidth: 2,
    ...(Platform.OS !== 'web' ? {
      shadowOpacity: 0.4,
      shadowRadius: 24,
      elevation: 20,
    } : {
      boxShadow: '0 16px 32px rgba(0,0,0,0.2), 0 6px 12px rgba(0,0,0,0.15)',
    }),
  },
  searchBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12, // Reduced padding to give more space for text
    paddingVertical: 8,
    height: 56, // Standard height for better proportions
    backgroundColor: 'rgba(255,255,255,0.18)', // True glassmorphism opacity
  },
  searchIcon: {
    margin: 0,
    marginLeft: 0, // Reduced margin
    backgroundColor: 'transparent',
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16, // Standard size for better proportions
    fontWeight: '400', // Regular weight as per design specs
    fontFamily: 'Inter', // Consistent with app font preference
    paddingHorizontal: 8, // Reduced padding to prevent text cutoff
    paddingVertical: 0,
    height: '100%',
    textAlignVertical: 'center',
    letterSpacing: 0.2, // As per UI enhancement specs
    textShadowColor: 'rgba(0,0,0,0.3)', // Subtle shadow for glassmorphism
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    opacity: 1,
    minWidth: 0, // Prevent text overflow
  },
  clearButton: {
    marginRight: 2, // Reduced margin
    backgroundColor: 'rgba(255,255,255,0.15)', // Subtle glassmorphism background
    borderRadius: 12, // Consistent with design specs
  },
  spacer: {
    width: 36, // Slightly smaller to give more text space
    height: 40,
  },
});