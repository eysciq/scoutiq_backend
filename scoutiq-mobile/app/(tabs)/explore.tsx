import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, TextInput, StatusBar, Alert } from 'react-native';
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
        <Text style={styles.headerTitle}>Yıldızlar Havuzu</Text>
        <TouchableOpacity onPress={fetchData}><MaterialCommunityIcons name="refresh" size={24} color="#2ecc71" /></TouchableOpacity>
      </View>
      <View style={styles.searchBox}>
        <View style={styles.searchWrapper}>
          <MaterialCommunityIcons name="magnify" size={20} color="#555" />
          <TextInput style={styles.searchInput} placeholder="Dünya yıldızlarını ara..." placeholderTextColor="#555" value={searchQuery} onChangeText={setSearchQuery} />
        </View>
      </View>
      {loading ? <ActivityIndicator size="large" color="#2ecc71" style={{marginTop: 50}} /> : (
        <FlatList
          data={filteredPlayers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({item}) => {
            const colors = TEAM_COLORS[item.team?.toLowerCase().trim()] || { primary: '#2c2c2c', text: '#95a5a6' };
            return (
              <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: "/player-details", params: { id: item.id } })}>
                <View style={styles.cardMain}>
                  <View style={styles.worldIcon}><MaterialCommunityIcons name="earth" size={24} color="#fff" /></View>
                  <View style={{flex: 1}}><Text style={styles.pName}>{item.name}</Text><Text style={styles.pSub}>{item.position} • {item.age || '20'} Yaş</Text></View>
                  <View style={[styles.tBadge, { backgroundColor: colors.primary }]}><Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 10 }}>{item.team?.substring(0,3).toUpperCase() || 'GLB'}</Text></View>
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ padding: 15 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 40, backgroundColor: '#1e1e1e' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  searchBox: { padding: 15, backgroundColor: '#1e1e1e', borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2c2c2c', borderRadius: 12, paddingHorizontal: 12, height: 45 },
  searchInput: { flex: 1, color: '#fff', marginLeft: 10 },
  card: { backgroundColor: '#1e1e1e', borderRadius: 15, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
  cardMain: { flexDirection: 'row', alignItems: 'center' },
  worldIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#2980b9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  pName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  pSub: { color: '#7f8c8d', fontSize: 12 },
  tBadge: { padding: 5, borderRadius: 5, minWidth: 40, alignItems: 'center' }
});