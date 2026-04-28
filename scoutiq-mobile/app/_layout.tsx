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
    // 🔥 NOT: Uygulaman scout ruhuna uygun olarak 'dark' modda daha iyi duruyor.
    // Cihaz ne olursa olsun DarkTheme'i zorlamak istersen 'DarkTheme' yazabilirsin.
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ 
        headerShown: false,
        animation: 'fade_from_bottom', // Sayfa geçişleri daha akıcı (premium) görünür
      }}>
        
        {/* 🚪 BEKÇİ / KONTROL SAYFASI (Giriş yapılmış mı kontrolü burada döner) */}
        <Stack.Screen name="index" />
        
        {/* 🔐 GİRİŞ & KAYIT SİSTEMİ */}
        <Stack.Screen name="auth" options={{ animation: 'fade' }} />
        
        {/* ⚽ ANA TAB SİSTEMİ (Portföy, Keşfet, Profil) */}
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        
        {/* 📝 GENEL MODAL SİSTEMİ */}
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