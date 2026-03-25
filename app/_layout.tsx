import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import colors from '../constants/colors';
import { ReportProvider } from '../context/ReportContext';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasLaunched, setHasLaunched] = useState<boolean>(false);
  const segments = useSegments();
  const router = useRouter();

  // Function to check auth state
  const checkAuthState = async () => {
    try {
      const launched = await AsyncStorage.getItem('hasLaunched');
      const userToken = await AsyncStorage.getItem('userToken');
      
      console.log('Checking auth state:', { 
        hasLaunched: launched === 'true', 
        isAuthenticated: !!userToken,
        userToken: userToken ? `${userToken.substring(0, 10)}...` : 'absent'
      });
      
      setHasLaunched(launched === 'true');
      setIsAuthenticated(!!userToken);
      
      return { hasLaunched: launched === 'true', isAuthenticated: !!userToken };
    } catch (error) {
      console.error('Error checking auth state:', error);
      return { hasLaunched: false, isAuthenticated: false };
    }
  };

  // Initial load
  useEffect(() => {
    const initialize = async () => {
      await checkAuthState();
      setIsLoading(false);
      await SplashScreen.hideAsync();
    };
    
    initialize();
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    const handleNavigation = async () => {
      if (isLoading) return;

      const authState = await checkAuthState();
      const inAuthGroup = segments[0] === '(auth)';
      const inOnboardingGroup = segments[0] === '(onboarding)';
      const inAppGroup = segments[0] === '(app)';

      console.log('Navigation check:', {
        isLoading,
        isAuthenticated: authState.isAuthenticated,
        hasLaunched: authState.hasLaunched,
        currentSegment: segments[0],
        inAuthGroup,
        inOnboardingGroup,
        inAppGroup,
      });

      if (!authState.hasLaunched && !inOnboardingGroup) {
        console.log('➡️ Redirecting to onboarding');
        router.replace('/(onboarding)');
      } 
      else if (authState.hasLaunched && !authState.isAuthenticated && !inAuthGroup && !inOnboardingGroup) {
        console.log('➡️ Redirecting to auth');
        router.replace('/(auth)');
      } 
      else if (authState.hasLaunched && authState.isAuthenticated && !inAppGroup && !inOnboardingGroup && !inAuthGroup) {
        console.log('➡️ Redirecting to app');
        router.replace('/(app)/(tabs)');
      }
    };

    handleNavigation();
  }, [segments, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

// Main App Component with Providers
export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Simulate font loading
    setTimeout(() => {
      setFontsLoaded(true);
    }, 100);
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <SafeAreaProvider>
        <ReportProvider>
          <RootLayoutNav />
        </ReportProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  gestureRoot: {
    flex: 1,
  },
});
