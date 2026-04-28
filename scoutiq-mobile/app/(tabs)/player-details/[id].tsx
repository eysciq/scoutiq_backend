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
      // Backend'deki yeni endpoint'imizden veriyi çekiyoruz
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
  const colors = TEAM_COLORS[teamKey] || { primary: '#1e1e1e', secondary: '#2c3e50', text: '#fff' };

  // Backend'den gelen gerçek tahminleri (predictions) kullan, yoksa mock göster
  const discoverers = player.predictions && player.predictions.length > 0 
    ? player.predictions 
    : [
        { id: '1', user: { name: "The Visionary" }, discoveryOrder: 1, multiplier: 5.0, predictedAt: "Yeni" },
        { id: '2', user: { name: "Erdem Y." }, discoveryOrder: 2, multiplier: 3.0, predictedAt: "1s önce" }
      ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* ÜST BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Scout Raporu</Text>
        <View style={{ width: 32 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* KİMLİK KARTI */}
        <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
          <View style={styles.ratingContainer}>
            <View style={styles.ratingCircle}>
              <Text style={styles.ratingValue}>{player.rating || '?'}</Text>
            </View>
            <View style={styles.valueBadge}>
               <Text style={styles.valueText}>
                 {player.currentMarketValue ? `${(player.currentMarketValue / 1000000).toFixed(1)}M €` : "Bedelsiz"}
               </Text>
            </View>
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
              <Text style={styles.infoText}>{player.age || '20'}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>AYAK</Text>
              <Text style={styles.infoText}>{player.foot || 'Sağ'}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>LİG</Text>
              <Text style={styles.infoText}>{player.league || 'Global'}</Text>
            </View>
          </View>

          {/* 🚀 VİZYONERLER LİSTESİ (YATIRIMCI BURAYA BAKAR) */}
          <View style={styles.discoverersHeader}>
            <Text style={styles.sectionTitle}>🏆 KEŞİF SIRALAMASI</Text>
            <MaterialCommunityIcons name="trophy-outline" size={18} color="#f1c40f" />
          </View>
          
          <View style={styles.discoverersContainer}>
            {discoverers.map((disc: any) => (
              <View key={disc.id} style={styles.discovererRow}>
                <View style={styles.discovererLeft}>
                  <View style={[styles.rankBadge, disc.discoveryOrder === 1 && { backgroundColor: '#f1c40f' }]}>
                    <Text style={[styles.discovererRank, disc.discoveryOrder === 1 && { color: '#000' }]}>
                      #{disc.discoveryOrder}
                    </Text>
                  </View>
                  <Text style={styles.discovererName}>{disc.user?.name}</Text>
                  {disc.discoveryOrder === 1 && (
                    <MaterialCommunityIcons name="crown" size={16} color="#f1c40f" style={{ marginLeft: 5 }} />
                  )}
                </View>
                <View style={styles.multiplierBadge}>
                  <Text style={styles.multiplierText}>{disc.multiplier?.toFixed(1)}x Çarpan</Text>
                </View>
              </View>
            ))}
          </View>

          {/* OYUNCU NOTU VEYA ETİKETLER */}
          <Text style={styles.sectionTitle}>SCOUT ANALİZİ</Text>
          <View style={styles.analysisBox}>
            <Text style={styles.analysisText}>
              Bu oyuncu potansiyel değeriyle "The Visionary" algoritmasında yüksek puan topladı. 
              {discoverers.length === 1 ? " Henüz dünyada sadece 1 scout tarafından keşfedildi!" : ` Şu an ${discoverers.length} scout'un radarında.`}
            </Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  topBarTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase' },
  heroCard: { margin: 20, padding: 25, borderRadius: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 10 },
  ratingContainer: { alignItems: 'center', marginBottom: 15 },
  ratingCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.1)' },
  ratingValue: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  valueBadge: { marginTop: -15, backgroundColor: '#2ecc71', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  valueText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  playerName: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  teamName: { fontSize: 14, marginTop: 4, fontWeight: '500', color: '#bdc3c7' },
  infoSection: { padding: 20 },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  infoBox: { backgroundColor: '#1a1a1a', padding: 15, borderRadius: 20, width: '31%', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  infoLabel: { color: '#7f8c8d', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  infoText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  sectionTitle: { color: '#fff', fontSize: 13, fontWeight: '800', marginBottom: 15, letterSpacing: 1.5 },
  discoverersHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  discoverersContainer: { backgroundColor: '#1a1a1a', borderRadius: 20, padding: 10, marginBottom: 25 },
  discovererRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#262626' },
  discovererLeft: { flexDirection: 'row', alignItems: 'center' },
  rankBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  discovererRank: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  discovererName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  multiplierBadge: { backgroundColor: 'rgba(241, 196, 15, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(241, 196, 15, 0.3)' },
  multiplierText: { color: '#f1c40f', fontSize: 11, fontWeight: 'bold' },
  analysisBox: { backgroundColor: '#1a1a1a', padding: 20, borderRadius: 20, borderLeftWidth: 4, borderLeftColor: '#2ecc71' },
  analysisText: { color: '#bdc3c7', fontSize: 14, lineHeight: 22 }
});