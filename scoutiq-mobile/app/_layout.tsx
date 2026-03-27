import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

// 🛑 Uygulama açılış ekranının hemen kaybolmasını engeller (Pürüzsüz açılış için)
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Uygulamanın iskeleti yüklendiğinde açılış logosunu yumuşakça gizler
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        
        {/* 🚪 BEKÇİ SAYFASI (Giriş yapılmış mı kontrol eder) */}
        <Stack.Screen name="index" />
        
        {/* 🔐 GİRİŞ / KAYIT SAYFASI */}
        <Stack.Screen name="login" />
        
        {/* ⚽ ANA UYGULAMA (Portföy, Keşfet, Profil sekmeleri) */}
        <Stack.Screen name="(tabs)" />
        
        {/* ❌ YANLIŞ LİNK HATASI */}
        <Stack.Screen name="+not-found" options={{ presentation: 'modal' }} />
        
      </Stack>
    </ThemeProvider>
  );
}