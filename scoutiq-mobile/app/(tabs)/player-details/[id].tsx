import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CONFIG, TEAM_COLORS } from '../../../constants';

export default function PlayerDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/player-details/${id}`);
      const data = await response.json();
      setPlayer(data);
    } catch (error) {
      console.error("Detay Hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [id])
  );

  if (loading) return (
    <View style={[styles.container, { justifyContent: 'center' }]}>
      <ActivityIndicator size="large" color="#2ecc71" />
    </View>
  );

  if (!player) return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={{ color: '#fff' }}>Oyuncu bulunamadı.</Text>
    </View>
  );

  const teamKey = player.team ? player.team.toLowerCase().trim() : '';
  const colors = TEAM_COLORS[teamKey] || { primary: '#2c3e50', secondary: '#34495e', text: '#fff' };

  // 🔥 HATAYI ÇÖZEN KRİTİK SATIR: tags null veya string gelse bile onu listeye çeviriyoruz
  const safeTags = Array.isArray(player.tags) 
    ? player.tags 
    : (typeof player.tags === 'string' ? player.tags.split(',').filter((t: string) => t !== "") : []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* ÜST BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Oyuncu Profili</Text>
        <TouchableOpacity onPress={() => router.push({ pathname: "/edit-player", params: { id: player.id } })}>
          <MaterialCommunityIcons name="pencil" size={24} color="#2ecc71" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* KİMLİK KARTI */}
        <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
          <View style={styles.ratingCircle}>
            <Text style={styles.ratingValue}>{player.rating || 'N/A'}</Text>
          </View>
          <Text style={[styles.playerName, { color: colors.text }]}>{player.name}</Text>
          <Text style={[styles.teamName, { color: colors.text, opacity: 0.8 }]}>
            {player.team} • {player.position}
          </Text>
        </View>

        {/* DETAYLAR */}
        <View style={styles.infoSection}>
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>YAŞ</Text>
              <Text style={styles.infoText}>{player.age || '-'}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>AYAK</Text>
              <Text style={styles.infoText}>{player.foot || '-'}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>BOY / KİLO</Text>
              <Text style={styles.infoText}>{player.height || '-'}/{player.weight || '-'}</Text>
            </View>
          </View>

          {/* ETİKETLER - GÜVENLİ LİSTE KULLANILIYOR */}
          <Text style={styles.sectionTitle}>SCOUT ETİKETLERİ</Text>
          <View style={styles.tagContainer}>
            {safeTags.length > 0 ? safeTags.map((tag: string, index: number) => (
              <View key={index} style={styles.tagBadge}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            )) : (
              <Text style={{ color: '#555', fontSize: 13 }}>Etiket eklenmemiş.</Text>
            )}
          </View>

          {/* KONUM BİLGİSİ */}
          <View style={styles.locationCard}>
             <MaterialCommunityIcons name="map-marker" size={20} color="#2ecc71" />
             <Text style={styles.locationText}>{player.country} • {player.league}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 10 },
  topBarTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  heroCard: { margin: 20, padding: 30, borderRadius: 30, alignItems: 'center', elevation: 10 },
  ratingCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  ratingValue: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  playerName: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  teamName: { fontSize: 16, marginTop: 5 },
  infoSection: { padding: 20 },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  infoBox: { backgroundColor: '#1e1e1e', padding: 15, borderRadius: 15, width: '31%', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  infoLabel: { color: '#2ecc71', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  infoText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  tagBadge: { backgroundColor: '#2c2c2c', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#444' },
  tagText: { color: '#2ecc71', fontSize: 12, fontWeight: 'bold' },
  locationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e1e', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#333' },
  locationText: { color: '#95a5a6', marginLeft: 10, fontWeight: 'bold' }
});