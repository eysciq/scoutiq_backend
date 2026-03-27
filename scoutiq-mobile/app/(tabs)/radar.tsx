import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, FlatList, TextInput, ActivityIndicator, StatusBar, Keyboard } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = 'http://192.168.1.181:3001';

export default function RadarScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);

  const [posFilter, setPosFilter] = useState('Hepsi');
  const [footFilter, setFootFilter] = useState('Hepsi');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxRating, setMaxRating] = useState('');

  const positions = ['Hepsi', 'Forvet', 'Orta Saha', 'Defans', 'Kaleci'];
  const feet = ['Hepsi', 'Sağ', 'Sol', 'İki Ayak'];

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const email = await AsyncStorage.getItem('userEmail');
      const safeEmail = email ? encodeURIComponent(email.toLowerCase().trim()) : '';

      const [myRes, globalRes] = await Promise.all([
        fetch(`${BACKEND_URL}/players?scoutEmail=${safeEmail}`),
        fetch(`${BACKEND_URL}/global-players`)
      ]);

      const myData = myRes.ok ? await myRes.json() : [];
      const globalData = globalRes.ok ? await globalRes.json() : [];

      // 🔥 Burası Kritik: Backend'den gelen veride isGlobal yoksa bile düzeltiyoruz
      const processedGlobal = globalData.map((p: any) => ({ ...p, isGlobal: true }));

      const combined = [...myData, ...processedGlobal];
      const uniquePlayers = Array.from(new Map(combined.map(item => [item.id, item])).values());

      setAllPlayers(uniquePlayers);
      setFilteredPlayers(uniquePlayers); 
    } catch (error) {
      console.log("❌ Radar Veri Hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchAllData(); }, []));

  const applyFilters = () => {
    Keyboard.dismiss(); 
    const filtered = allPlayers.filter(p => {
      // Mevki Kontrolü (Türkçe ve İngilizce karşılıklarını kontrol eder)
      if (posFilter !== 'Hepsi') {
        const pPos = (p.position || '').toLowerCase();
        const fPos = posFilter.toLowerCase();
        
        if (fPos === 'forvet' && !pPos.includes('forvet') && !pPos.includes('attacker')) return false;
        if (fPos === 'orta saha' && !pPos.includes('orta saha') && !pPos.includes('midfielder')) return false;
        if (fPos === 'defans' && !pPos.includes('defans') && !pPos.includes('defender')) return false;
        if (fPos === 'kaleci' && !pPos.includes('kaleci') && !pPos.includes('goalkeeper')) return false;
      }

      if (footFilter !== 'Hepsi' && p.foot !== footFilter) return false;
      
      const playerAge = parseInt(p.age, 10);
      if (minAge.trim() !== '' && (isNaN(playerAge) || playerAge < parseInt(minAge, 10))) return false;
      if (maxAge.trim() !== '' && (isNaN(playerAge) || playerAge > parseInt(maxAge, 10))) return false;

      if (!p.isGlobal) {
        const playerRating = parseInt(p.rating, 10);
        if (minRating.trim() !== '' && (isNaN(playerRating) || playerRating < parseInt(minRating, 10))) return false;
        if (maxRating.trim() !== '' && (isNaN(playerRating) || playerRating > parseInt(maxRating, 10))) return false;
      }

      return true;
    });
    setFilteredPlayers(filtered);
  };

  const clearFilters = () => {
    setPosFilter('Hepsi');
    setFootFilter('Hepsi');
    setMinAge('');
    setMaxAge('');
    setMinRating('');
    setMaxRating('');
    setFilteredPlayers(allPlayers);
    Keyboard.dismiss();
  };

  const renderPlayer = ({ item }: any) => {
    // 🌍 KESİN ÇÖZÜM: discoveredBy 'API_FOOTBALL' ise her türlü Globaldir
    const isGlobal = item.isGlobal === true || item.discoveredBy === 'API_FOOTBALL';
    const isHighPotential = !isGlobal && parseInt(item.rating) >= 80;

    // Mevki Türkçeleştirme (Görünüm için)
    let displayPos = item.position || 'Bilinmiyor';
    if (displayPos.includes('Attacker')) displayPos = 'Forvet';
    if (displayPos.includes('Midfielder')) displayPos = 'Orta Saha';
    if (displayPos.includes('Defender')) displayPos = 'Defans';
    if (displayPos.includes('Goalkeeper')) displayPos = 'Kaleci';
    
    return (
      <TouchableOpacity 
        style={styles.playerCard} 
        activeOpacity={0.8}
        onPress={() => router.push(`/(tabs)/player-details?id=${item.id}`)}
      >
        <View style={styles.cardInfo}>
          <Text style={styles.playerName}>{item.name}</Text>
          <Text style={styles.playerSub}>{displayPos} • {item.age || '20'} Yaş • {item.foot || 'Sağ'} Ayak</Text>
          <Text style={styles.playerTeam}>{item.team || 'Dünya Yıldızı'}</Text>
        </View>

        {/* 🛡️ REYTİNG CANAVARINI ÖLDÜREN KISIM */}
        {isGlobal ? (
          <View style={[styles.ratingBadge, { backgroundColor: '#2980b9' }]}>
            <MaterialCommunityIcons name="earth" size={24} color="#fff" />
          </View>
        ) : (
          <View style={[styles.ratingBadge, { backgroundColor: isHighPotential ? '#f1c40f' : '#2ecc71' }]}>
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <MaterialCommunityIcons name="radar" size={32} color="#2ecc71" />
        <Text style={styles.headerTitle}>Gelişmiş Radar</Text>
      </View>

      <View style={styles.controlPanel}>
        <View style={styles.inputRow}>
          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>Yaş Aralığı</Text>
            <View style={{flexDirection: 'row', gap: 5}}>
                <TextInput style={styles.input} placeholder="Min" placeholderTextColor="#555" keyboardType="numeric" value={minAge} onChangeText={setMinAge} />
                <TextInput style={styles.input} placeholder="Max" placeholderTextColor="#555" keyboardType="numeric" value={maxAge} onChangeText={setMaxAge} />
            </View>
          </View>
          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>Potansiyel (Sadece Portföy)</Text>
            <View style={{flexDirection: 'row', gap: 5}}>
                <TextInput style={styles.input} placeholder="Min" placeholderTextColor="#555" keyboardType="numeric" value={minRating} onChangeText={setMinRating} />
                <TextInput style={styles.input} placeholder="Max" placeholderTextColor="#555" keyboardType="numeric" value={maxRating} onChangeText={setMaxRating} />
            </View>
          </View>
        </View>

        <Text style={styles.filterTitle}>Mevki Tercihi</Text>
        <FlatList horizontal showsHorizontalScrollIndicator={false} data={positions} keyExtractor={(item) => item} style={styles.chipList}
          renderItem={({item}) => (
            <TouchableOpacity style={[styles.chip, posFilter === item && styles.chipActive]} onPress={() => setPosFilter(item)}>
              <Text style={[styles.chipText, posFilter === item && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
            <MaterialCommunityIcons name="refresh" size={20} color="#e74c3c" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
            <MaterialCommunityIcons name="magnify" size={20} color="#000" />
            <Text style={styles.applyBtnText}>Taramayı Başlat</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>Bulunan Kayıt: <Text style={{color: '#2ecc71'}}>{filteredPlayers.length}</Text></Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2ecc71" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={filteredPlayers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPlayer}
          contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-search-outline" size={60} color="#333" />
              <Text style={styles.emptyText}>Kriterlere uygun yetenek bulunamadı.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { padding: 20, paddingTop: 40, backgroundColor: '#1e1e1e', flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#333' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  controlPanel: { backgroundColor: '#1e1e1e', padding: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5 },
  inputRow: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  inputBox: { flex: 1 },
  inputLabel: { color: '#2ecc71', fontSize: 10, fontWeight: 'bold', marginBottom: 6, textTransform: 'uppercase' },
  input: { flex: 1, backgroundColor: '#2c2c2c', color: '#fff', height: 40, borderRadius: 10, paddingHorizontal: 10, fontSize: 13, borderWidth: 1, borderColor: '#333' },
  filterTitle: { color: '#7f8c8d', fontSize: 10, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' },
  chipList: { marginBottom: 15, flexGrow: 0 },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#2c2c2c', marginRight: 8, borderWidth: 1, borderColor: '#444' },
  chipActive: { backgroundColor: '#2ecc71', borderColor: '#2ecc71' },
  chipText: { color: '#95a5a6', fontWeight: 'bold', fontSize: 11 },
  chipTextActive: { color: '#000' },
  actionRow: { flexDirection: 'row', gap: 10 },
  clearBtn: { width: 50, height: 50, backgroundColor: '#2c2c2c', borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e74c3c' },
  applyBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2ecc71', height: 50, borderRadius: 15, gap: 8 },
  applyBtnText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  resultsHeader: { padding: 15, paddingBottom: 0 },
  resultsCount: { color: '#95a5a6', fontSize: 12, fontWeight: 'bold' },
  playerCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1e1e', padding: 18, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
  cardInfo: { flex: 1 },
  playerName: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  playerSub: { color: '#95a5a6', fontSize: 11 },
  playerTeam: { color: '#2ecc71', fontSize: 11, fontWeight: 'bold', marginTop: 4 },
  ratingBadge: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  ratingText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#444', marginTop: 10, textAlign: 'center', paddingHorizontal: 40 }
});