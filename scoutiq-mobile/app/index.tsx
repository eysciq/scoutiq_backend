import React, { useEffect } from 'react';
import { View, ActivityIndicator, StatusBar, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AppGatekeeper() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const checkLoginStatus = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        
        if (!isMounted) return;

        if (email && email !== "") {
          // ✅ Giriş varsa (tabs) altına git
          // Eğer hata verirse router.replace('/(tabs)' as any) yapabilirsin
          router.replace('/(tabs)');
        } else {
          // ❌ HATA BURADAYDI: Senin projen /auth bekliyor
          // TypeScript hatasını zorla aşmak için 'as any' ekledik 
          // Ama en doğrusu senin auth dosyanın adını kontrol etmektir
          router.replace('/auth' as any);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Giriş kontrol hatası:", error);
          router.replace('/auth' as any);
        }
      }
    };

    const timer = setTimeout(checkLoginStatus, 500);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ActivityIndicator size="large" color="#2ecc71" />
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#555" style={{ marginBottom: 10 }} />
        <Text style={styles.footerText}>ScoutIQ Sistemleri Yükleniyor...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
  footer: { position: 'absolute', bottom: 50, alignItems: 'center' },
  footerText: { color: '#555', fontSize: 12, letterSpacing: 1, fontWeight: '600' }
});