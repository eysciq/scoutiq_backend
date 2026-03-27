import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

// 🛑 Uygulama açılış ekranının pürüzsüz olması için bekletiyoruz
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Uygulama hazır olduğunda splash screen'i gizle
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        
        {/* 🚪 BEKÇİ / KONTROL SAYFASI */}
        <Stack.Screen name="index" />
        
        {/* 🔐 GİRİŞ & KAYIT SİSTEMİ */}
        <Stack.Screen name="login" />
        
        {/* ⚽ ANA TAB SİSTEMİ (Portföy, Keşfet, Profil) */}
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        
        {/* 📝 OYUNCU DÜZENLEME & CLONE SAYFASI */}
        <Stack.Screen 
          name="edit-player" 
          options={{ 
            presentation: 'modal', // Alttan açılan şık bir modal efekti
            animation: 'slide_from_bottom' 
          }} 
        />

        {/* 🔍 OYUNCU DETAY SAYFASI */}
        <Stack.Screen 
          name="player-details/[id]" 
          options={{ 
            presentation: 'card', 
            animation: 'slide_from_right' 
          }} 
        />
        
        {/* 🏆 LİDERLİK TABLOSU (Eğer ayrı sayfaysa) */}
        <Stack.Screen name="leaderboard" options={{ presentation: 'modal' }} />

        {/* ❌ HATA SAYFASI */}
        <Stack.Screen name="+not-found" options={{ presentation: 'transparentModal' }} />
        
      </Stack>
    </ThemeProvider>
  );
}