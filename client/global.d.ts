// Global type definitions for the weather app

declare module '*.png' {
  const value: any;
  export = value;
}

declare module '*.jpg' {
  const value: any;
  export = value;
}

declare module '*.jpeg' {
  const value: any;
  export = value;
}

declare module '*.svg' {
  const value: any;
  export = value;
}

// Extend React Native types for web compatibility
declare module 'react-native' {
  interface ViewStyle {
    textShadow?: string;
  }
  
  interface TextStyle {
    textShadow?: string;
  }
}

// Global weather app types
declare global {
  interface Window {
    __WEATHER_APP_DEV__?: boolean;
  }
  
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      EXPO_PUBLIC_API_URL?: string;
      EXPO_PUBLIC_WEATHER_API_KEY?: string;
    }
  }
}

// Export empty object to make this a module
export {};