import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Constants from 'expo-constants';

const TestEnvVars = () => {
  useEffect(() => {
    console.log('Testing environment variables:');
    console.log('process.env.EXPO_PUBLIC_OPENAI_API_KEY:', process.env.EXPO_PUBLIC_OPENAI_API_KEY);
    console.log('Constants.expoConfig.extra.EXPO_PUBLIC_OPENAI_API_KEY:', Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENAI_API_KEY);
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text>Check console logs for environment variable values</Text>
    </View>
  );
};

export default TestEnvVars;