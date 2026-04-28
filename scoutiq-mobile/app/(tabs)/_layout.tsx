import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, 
        // 🎨 Modern Dark Navigasyon Tasarımı
        tabBarStyle: {
          backgroundColor: '#0f0f0f', // Daha derin siyah
          borderTopWidth: 1,
          borderTopColor: '#262626',
          height: Platform.OS === 'ios' ? 90 : 70, 
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 10,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: '#2ecc71', // Neon Yeşil
        tabBarInactiveTintColor: '#555', // Sönük Gri
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginBottom: 0,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
      }}
    >
      {/* 1. PORTFÖYÜM (Tahminlerim) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Portföy',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="shield-star-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 2. KEŞFET (Genel Oyuncu Havuzu) */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Keşfet',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="compass-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ➕ 3. YENİ RAPOR (Merkezi Buton) */}
      <Tabs.Screen
        name="add"
        options={{
          tabBarLabel: 'Scout',
          title: 'Yeni Keşif', 
          tabBarIcon: ({ color, size }) => (
            <View style={{
              backgroundColor: '#2ecc71',
              width: 50,
              height: 50,
              borderRadius: 25,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: -20,
              borderWidth: 4,
              borderColor: '#0f0f0f',
              elevation: 5,
            }}>
              <MaterialCommunityIcons name="plus" size={32} color="#000" />
            </View>
          ),
        }}
      />

      {/* 📓 4. NOTLARIM (Notebook - Visionary Fallback) */}
      <Tabs.Screen
        name="notebook" // Bu dosyayı (notebook.tsx) oluşturacağız
        options={{
          title: 'Notlarım',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="notebook-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 🏆 5. SIRALAMA (Leaderboard) */}
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Sıralama',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="trophy-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 👤 6. PROFİL */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 🛡️ GİZLİ ROTALAR (Menüde görünmezler) */}
      <Tabs.Screen 
        name="compare" 
        options={{ href: null, tabBarButton: () => null }} 
      />
      
      <Tabs.Screen 
        name="edit-player" 
        options={{ href: null, tabBarButton: () => null }} 
      />
      
      <Tabs.Screen 
        name="player-details/[id]" 
        options={{ href: null, tabBarButton: () => null }} 
      />
      
    </Tabs>
  );
}