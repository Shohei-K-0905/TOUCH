import '../src/firebase'; // Firebase初期化
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router'; // useRouter と useSegments をインポート
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react'; // React と useState をインポート
import { useColorScheme } from 'react-native'; // Platform は不要なら削除
import { SafeAreaProvider } from 'react-native-safe-area-context';
// AsyncStorage のインポートは不要なら削除
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLocale } from '@/utils/localization';
import { useAuthStore } from '@/store/auth-store'; // useAuthStore をインポート

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // isLoading はストアで自動的に管理される (初期値 true -> 認証状態確定で false)
  const { isLoading } = useAuthStore();
  const [isAppReady, setIsAppReady] = useState(false); // ローカライズ等の準備完了フラグ
  console.log('RootLayout: Render - isLoading:', isLoading, 'isAppReady:', isAppReady);

  useEffect(() => {
    console.log('RootLayout: useEffect setupApp - Start');
    const setupApp = async () => {
      try {
        await setLocale('ja');
        console.log('RootLayout: useEffect setupApp - Locale set');
      } catch (error) {
        console.error('Error during app setup:', error);
      } finally {
        setIsAppReady(true);
        console.log('RootLayout: useEffect setupApp - Finished, isAppReady set to true');
      }
    };
    setupApp();
  }, []);

  // 認証チェック(isLoading)と他の初期化(isAppReady)が終わるまで待機
  if (isLoading || !isAppReady) {
    console.log('RootLayout: Render - Waiting (isLoading || !isAppReady)');
    return null; // またはローディングインジケーターを表示
  }

  console.log('RootLayout: Render - Rendering RootLayoutNav');
  return <RootLayoutNav />; // RootLayoutNav をレンダリング
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuthStore(); // 認証状態を取得
  const router = useRouter();
  const segments = useSegments(); // 現在のルートセグメントを取得
  console.log('RootLayoutNav: Render - isAuthenticated:', isAuthenticated, 'segments:', segments);

  useEffect(() => {
    console.log('RootLayoutNav: useEffect - Start, isAuthenticated:', isAuthenticated);
    const isAuthResolved = typeof isAuthenticated === 'boolean';
    console.log('RootLayoutNav: useEffect - isAuthResolved:', isAuthResolved);

    if (!isAuthResolved) {
      console.log('RootLayoutNav: useEffect - Auth not resolved yet, returning');
      return;
    }

    console.log('RootLayoutNav: useEffect - Hiding SplashScreen');
    SplashScreen.hideAsync();

    const inAuthGroup = segments[0] === '(auth)';
    console.log('RootLayoutNav: useEffect - inAuthGroup:', inAuthGroup);

    if (isAuthenticated && inAuthGroup) {
      console.log('RootLayoutNav: useEffect - User authenticated and in auth group, replacing to /(tabs)');
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthGroup) {
      console.log('RootLayoutNav: useEffect - User not authenticated and not in auth group, replacing to /(auth)');
      router.replace('/(auth)');
    } else {
      console.log('RootLayoutNav: useEffect - No navigation needed');
    }

  }, [isAuthenticated, segments, router]);

  // isAuthenticated が null (チェック中) の間は何も表示しない方が安全かもしれない
  // if (isAuthenticated === null) return null;

  console.log('RootLayoutNav: Render - Rendering Stack');
  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ 
          headerShown: false,
          // Ensure no header is shown
          header: () => null
        }}>
          {/* 各ルートの設定 */}
          <Stack.Screen 
            name="(auth)" 
            options={{ 
              headerShown: false,
              // title: "TOUCH", // headerShown:falseなら不要
              // Explicitly hide the header for auth routes
              // header: () => null, // screenOptionsで設定済み
            }} 
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          {/* profile スクリーンを追加 */}
          <Stack.Screen name="profile" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}