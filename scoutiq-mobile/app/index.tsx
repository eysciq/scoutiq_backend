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
        // 🔍 Hafızada kayıtlı e-posta var mı bakıyoruz
        const email = await AsyncStorage.getItem('userEmail');
        
        if (!isMounted) return;

        if (email && email.trim() !== "") {
          // ✅ Giriş yapılmış, ana menüye (tabs) fırlat
          router.replace('/(tabs)');
        } else {
          // ❌ Giriş yok, giriş ekranına (auth) fırlat
          router.replace('/auth');
        }
      } catch (error) {
        if (isMounted) {
          console.error("Giriş kontrol hatası:", error);
          router.replace('/auth');
        }
      }
    };

    // 🚀 Splash screen hissi vermek ve sistemin oturmasını beklemek için kısa bir gecikme
    const timer = setTimeout(checkLoginStatus, 800);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* 🟢 Ana Yükleyici */}
      <ActivityIndicator size="large" color="#2ecc71" />
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>SCOUTIQ GÜVENLİK KONTROLÜ</Text>
        <ActivityIndicator size="small" color="#333" style={{ marginTop: 10 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#121212', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  footer: { 
    position: 'absolute', 
    bottom: 60, 
    alignItems: 'center' 
  },
  footerText: { 
    color: '#333', 
    fontSize: 10, 
    letterSpacing: 2, 
    fontWeight: '800' 
  }
});