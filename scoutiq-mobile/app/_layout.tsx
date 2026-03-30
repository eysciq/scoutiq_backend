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
        
        {/* 🔐 GİRİŞ & KAYIT SİSTEMİ (auth klasörü) */}
        <Stack.Screen name="auth" />
        
        {/* ⚽ ANA TAB SİSTEMİ (Portföy, Keşfet, Profil ve Alt Sayfalar) */}
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        
        {/* 📝 MODAL (Eğer genel bir modal kullanıyorsan) */}
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal', 
            animation: 'slide_from_bottom' 
          }} 
        />
        
      </Stack>
    </ThemeProvider>
  );
}