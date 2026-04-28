import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, TextInput, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CONFIG, TEAM_COLORS } from '../../constants';

export default function ExploreScreen() {
  const [players, setPlayers] = useState<any[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${CONFIG.BACKEND_URL}/global-players`);
      const data = await response.json();
      setPlayers(data);
      setFilteredPlayers(data);
    } catch (error) {
      console.log("❌ Keşfet Hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const res = players.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()));
    setFilteredPlayers(res);
  }, [searchQuery, players]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="earth" size={28} color="#2980b9" style={{ marginRight: 10 }} />
          <Text style={styles.headerTitle}>Dünya Havuzu</Text>
        </View>
        <TouchableOpacity onPress={fetchData} style={styles.refreshBtn}>
          <MaterialCommunityIcons name="radar" size={24} color="#2ecc71" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchBox}>
        <View style={styles.searchWrapper}>
          <MaterialCommunityIcons name="magnify" size={20} color="#95a5a6" />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Geleceğin yıldızlarını ara..." 
            placeholderTextColor="#7f8c8d" 
            value={searchQuery} 
            onChangeText={setSearchQuery} 
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2ecc71" />
          <Text style={styles.loadingText}>Global Veri Tabanı Taranıyor...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPlayers}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 15, paddingBottom: 80 }}
          renderItem={({item}) => {
            const colors = TEAM_COLORS[item.team?.toLowerCase().trim()] || { primary: '#2c2c2c', text: '#95a5a6' };
            return (
              <TouchableOpacity 
                style={styles.card} 
                // 🔥 ASIL DÜZELTME BURADA: Uygulamayı çökerten hatalı yönlendirme düzeltildi!
                onPress={() => router.push(`/player-details/${item.id}`)}
              >
                <View style={styles.cardMain}>
                  <View style={styles.worldIcon}>
                    <MaterialCommunityIcons name="incognito" size={24} color="#fff" />
                  </View>
                  <View style={{flex: 1, paddingRight: 10}}>
                    <Text style={styles.pName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.pSub}>{item.position} • {item.age || '?'} Yaş</Text>
                  </View>
                  
                  <View style={styles.actionRight}>
                    <View style={[styles.tBadge, { backgroundColor: colors.primary, borderColor: colors.secondary || colors.primary, borderWidth: 1 }]}>
                      <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 10 }}>
                        {item.team?.substring(0,3).toUpperCase() || 'GLB'}
                      </Text>
                    </View>
                    <View style={styles.scoutBadge}>
                      <Text style={styles.scoutBadgeText}>Radara Al</Text>
                      <MaterialCommunityIcons name="chevron-right" size={14} color="#f1c40f" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="radar" size={60} color="#333" />
              <Text style={styles.emptyStateText}>Radara yakalanan kimse yok.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'ios' ? 10 : 40, backgroundColor: '#1e1e1e' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', letterSpacing: 0.5 },
  refreshBtn: { padding: 8, backgroundColor: 'rgba(46, 204, 113, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(46, 204, 113, 0.3)' },
  searchBox: { padding: 15, paddingTop: 5, backgroundColor: '#1e1e1e', borderBottomLeftRadius: 25, borderBottomRightRadius: 25, elevation: 5 },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2c2c2c', borderRadius: 15, paddingHorizontal: 15, height: 50, borderWidth: 1, borderColor: '#333' },
  searchInput: { flex: 1, color: '#fff', marginLeft: 10, fontSize: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#2ecc71', marginTop: 15, fontWeight: 'bold', letterSpacing: 1 },
  card: { backgroundColor: '#1e1e1e', borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#333', elevation: 3 },
  cardMain: { flexDirection: 'row', alignItems: 'center' },
  worldIcon: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#2c3e50', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#34495e' },
  pName: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  pSub: { color: '#95a5a6', fontSize: 12, fontWeight: '600' },
  actionRight: { alignItems: 'flex-end', justifyContent: 'space-between', height: 45 },
  tBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, minWidth: 45, alignItems: 'center', marginBottom: 5 },
  scoutBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(241, 196, 15, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  scoutBadgeText: { color: '#f1c40f', fontSize: 10, fontWeight: 'bold', marginRight: 2 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyStateText: { color: '#555', marginTop: 15, fontSize: 14, fontWeight: 'bold' }
});