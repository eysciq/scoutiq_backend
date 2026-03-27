import { useEffect } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AppGatekeeper() {
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Hafızada kullanıcının maili var mı diye bakıyoruz
        const email = await AsyncStorage.getItem('userEmail');
        
        if (email) {
          // 🔥 GÜVENLİ YÖNLENDİRME: TypeScript hatasını önlemek için tam rota
          // Kullanıcı giriş yaptıysa direkt Portföy (Tabs) kısmına
          router.replace('/(tabs)');
        } else {
          // Kullanıcı giriş yapmadıysa Giriş/Kayıt ekranına
          router.replace('/auth');
        }
      } catch (error) {
        // Bir hata oluşursa güvenli tarafta kalıp login'e atıyoruz
        console.error("Giriş kontrol hatası:", error);
        router.replace('/auth');
      }
    };

    // Yüklenme animasyonunun görünmesi için yarım saniye bekletiyoruz
    const timer = setTimeout(checkLoginStatus, 500);
    return () => clearTimeout(timer); // Bileşen kapanırsa timer'ı temizle
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' }}>
      <StatusBar barStyle="light-content" />
      {/* ScoutIQ Yeşili Loading */}
      <ActivityIndicator size="large" color="#2ecc71" />
    </View>
  );
}