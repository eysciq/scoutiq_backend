import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, 
        tabBarStyle: {
          backgroundColor: '#1a1a1a', 
          borderTopWidth: 1,
          borderTopColor: '#333',
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#2ecc71', // Neon Yeşil
        tabBarInactiveTintColor: '#7f8c8d', 
      }}
    >
      {/* 1. PORTFÖYÜM (Ana Sayfa) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Portföy',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="folder-account" size={size} color={color} />
          ),
        }}
      />

      {/* 📡 2. SCOUT RADARI (Eski Keşfet ile Birleşti - Tek Arama Motoru) */}
      <Tabs.Screen
        name="radar"
        options={{
          title: 'Keşfet & Radar',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="radar" size={size} color={color} />
          ),
        }}
      />

      {/* 3. ANA EKLEME SAYFASI */}
      <Tabs.Screen
        name="add"
        options={{
          tabBarLabel: 'Ekle',
          title: 'Yeni Rapor', 
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="plus-circle" size={size + 8} color={color} />
          ),
        }}
      />

      {/* 4. KIYASLA (Oyuncuları kapıştırdığımız yer) */}
      <Tabs.Screen
        name="compare"
        options={{
          title: 'Kıyasla',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="scale-balance" size={size} color={color} />
          ),
        }}
      />

      {/* 5. LİDERLİK TABLOSU */}
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Sıralama',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="trophy" size={size} color={color} />
          ),
        }}
      />

      {/* 6. PROFİL */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle" size={size} color={color} />
          ),
        }}
      />

      {/* 🛡️ GİZLİ ROTALAR (Menüde görünmezler) */}
      <Tabs.Screen name="explore" options={{ href: null }} /> {/* 🔥 Eski Keşfet sekmesi gizlendi */}
      <Tabs.Screen name="edit-player" options={{ href: null }} />
      <Tabs.Screen name="player-details" options={{ href: null }} />
      
    </Tabs>
  );
}