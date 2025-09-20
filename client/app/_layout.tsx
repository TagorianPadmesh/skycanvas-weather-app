import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { paperTheme } from '../theme/paperTheme';
import { useUnitStore } from '../store/unitSlice';
import { useAuth } from '../hooks/useAuth';
import { locationManager } from '../utils/locationManager';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 3,
    },
  },
});

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Don't do anything while loading

    const inAuthGroup = segments[0] === '(auth)';

    if (session && inAuthGroup) {
      // User is signed in and in auth group, redirect to cities page
      router.replace('/cities');
    } else if (!session && !inAuthGroup) {
      // User is not signed in and not in auth group, redirect to welcome
      router.replace('/(auth)/welcome');
    }
  }, [session, loading, segments]);

  return <Slot />;
}

export default function RootLayout() {
  useEffect(() => {
    useUnitStore.getState().loadUnit();
    
    // Initialize location detection when app starts
    // This will detect and cache the user's location for the entire app session
    (async () => {
      try {
        console.log('🚀 App started - initializing location detection...');
        await locationManager.getUserLocation();
        console.log('✅ Location initialization completed on app start');
      } catch (error) {
        console.log('⚠️ Location initialization failed on app start:', error);
      }
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={paperTheme}>
          <RootLayoutNav />
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}