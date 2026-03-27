import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, TextInput, ScrollView, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🎨 TAKIM RENKLERİ
const teamColors: any = {
  'galatasaray': { primary: '#A90432', text: '#FDB912' },
  'fenerbahçe': { primary: '#002347', text: '#FEDD00' },
  'beşiktaş': { primary: '#000000', text: '#FFFFFF' },
  'trabzonspor': { primary: '#800020', text: '#87ceeb' },
  'real madrid': { primary: '#FFFFFF', text: '#FEBE10' },
  'barcelona': { primary: '#004D98', text: '#A50044' },
  'manchester city': { primary: '#6CABDD', text: '#000000' },
};

export default function ExploreScreen() {
  const [players, setPlayers] = useState<any[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const BACKEND_URL = 'http://192.168.1.181:3001';

  const fetchData = async () => {
    try {
      setLoading(true);
      // Sadece Global Yıldızları çekiyoruz
      const response = await fetch(`${BACKEND_URL}/global-players`);
      const data = await response.json();
      
      setPlayers(data);
      setFilteredPlayers(data);
    } catch (error) {
      console.log("❌ Keşfet Veri çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    let result = players;
    if (searchQuery.trim() !== '') {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()));
    }
    setFilteredPlayers(result);
  }, [searchQuery, players]);

  const renderPlayer = ({ item }: any) => {
    const teamKey = item.team ? item.team.toLowerCase().trim() : '';
    const colors = teamColors[teamKey] || { primary: '#333', text: '#95a5a6' };

    return (
      <TouchableOpacity 
        style={styles.playerCard} 
        activeOpacity={0.8}
        onPress={() => router.push(`/(tabs)/player-details?id=${item.id}`)}
      >
        <View style={styles.cardHeader}>
          {/* 🔥 HAYALET REYTİNGLER SİLİNDİ, DÜNYA İKONU GELDİ */}
          <View style={[styles.ratingBadge, { backgroundColor: '#2980b9' }]}>
             <MaterialCommunityIcons name="earth" size={24} color="#fff" />
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.playerName}>{item.name}</Text>
            <Text style={styles.posText}>{item.position} • {item.team || 'Dünya Yıldızı'}</Text>
          </View>
          
          {/* TAKIM ROZETİ */}
          <View style={[styles.teamBadge, { backgroundColor: colors.primary, borderColor: colors.text, borderWidth: 1 }]}>
            <Text style={[styles.teamBadgeText, { color: colors.text }]}>
              {item.team ? item.team.substring(0, 3).toUpperCase() : 'GLB'}
            </Text>
          </View>
        </View>

        <View style={styles.footerRow}>
           <Text style={styles.viewRaporText}>Keşfet ve Not Ver</Text>
           <MaterialCommunityIcons name="chevron-right" size={18} color="#2ecc71" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yıldızlar Havuzu</Text>
        <TouchableOpacity onPress={fetchData} style={styles.refreshBtn}>
             <MaterialCommunityIcons name="refresh" size={24} color="#2ecc71" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
          <View style={styles.searchWrapper}>
            <MaterialCommunityIcons name="magnify" size={20} color="#555" style={{marginRight: 8}} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Dünya yıldızlarını ara..."
              placeholderTextColor="#555"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2ecc71" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredPlayers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPlayer}
          contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40, backgroundColor: '#1e1e1e' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  refreshBtn: { padding: 5 },
  searchBox: { padding: 15, backgroundColor: '#1e1e1e', borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2c2c2c', borderRadius: 12, paddingHorizontal: 12, height: 45 },
  searchInput: { flex: 1, color: '#fff', fontSize: 15 },
  playerCard: { backgroundColor: '#1e1e1e', borderRadius: 18, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#333', elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  ratingBadge: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  infoContainer: { flex: 1 },
  playerName: { fontSize: 17, fontWeight: 'bold', color: '#fff' },
  posText: { color: '#7f8c8d', fontSize: 12, marginTop: 3 },
  teamBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, minWidth: 45, alignItems: 'center' },
  teamBadgeText: { fontSize: 11, fontWeight: 'bold' },
  footerRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#222' },
  viewRaporText: { color: '#2ecc71', fontSize: 12, fontWeight: 'bold', marginRight: 5 }
});