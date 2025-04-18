import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLocale } from '@/utils/localization';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Set up localization
    const setupLocalization = async () => {
      try {
        // Set the locale to Japanese
        await setLocale('ja');
        
        // Hide splash screen once the app is ready
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('Error during initialization:', error);
        // Still hide splash screen even if there's an error
        await SplashScreen.hideAsync();
      }
    };
    
    setupLocalization();
  }, []);

  // Log AsyncStorage for debugging
  useEffect(() => {
    // Uncomment this line to clear AsyncStorage for debugging
    // AsyncStorage.clear();
    
    // Log all keys in AsyncStorage for debugging
    const logAsyncStorageKeys = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        console.log('AsyncStorage keys:', keys);
        
        // Log the daycare storage content
        if (keys.includes('daycare-storage')) {
          const daycareStorage = await AsyncStorage.getItem('daycare-storage');
          console.log('Daycare storage:', daycareStorage);
        }
      } catch (error) {
        console.error('Failed to log AsyncStorage keys:', error);
      }
    };
    
    logAsyncStorageKeys();
  }, []);

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ 
          headerShown: false,
          // Ensure no header is shown
          header: () => null
        }}>
          <Stack.Screen 
            name="(auth)" 
            options={{ 
              headerShown: false,
              title: "TOUCH",
              // Explicitly hide the header for auth routes
              header: () => null,
            }} 
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}