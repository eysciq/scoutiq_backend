import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, SafeAreaView, FlatList, ActivityIndicator, RefreshControl, StatusBar, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
// 🔥 DÜZELTME: Dinamik CONFIG yapısı eklendi
import { CONFIG } from '../../constants';

export default function LeaderboardScreen() {
  const [scouts, setScouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 📡 LİDERLİK VERİLERİNİ ÇEK
  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/leaderboard`);
      if (response.ok) {
        const data = await response.json();
        setScouts(data);
      }
    } catch (error) {
      console.log("Sıralama Hatası:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLeaderboard();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const getMedalColor = (index: number) => {
    if (index === 0) return '#f1c40f'; // Altın
    if (index === 1) return '#bdc3c7'; // Gümüş
    if (index === 2) return '#cd7f32'; // Bronz
    return '#34495e'; 
  };

  const getMedalBackground = (index: number) => {
    if (index === 0) return 'rgba(241, 196, 15, 0.08)'; 
    if (index === 1) return 'rgba(189, 195, 199, 0.08)'; 
    if (index === 2) return 'rgba(205, 127, 50, 0.08)'; 
    return '#1e1e1e';
  };

  const renderScout = ({ item, index }: { item: any; index: number }) => {
    const isTopThree = index < 3;
    const medalColor = getMedalColor(index);
    const bgColor = getMedalBackground(index);

    return (
      <View style={[
        styles.card, 
        { backgroundColor: bgColor },
        isTopThree && { ...styles.topThreeCard, borderColor: medalColor }
      ]}>
        <View style={styles.rankContainer}>
          {isTopThree ? (
            <MaterialCommunityIcons name="medal" size={36} color={medalColor} />
          ) : (
            <Text style={styles.rankText}>{index + 1}</Text>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={[styles.nameText, isTopThree && { color: medalColor }]}>
            {item.name ? item.name.toUpperCase() : "BİLİNMEYEN SCOUT"}
          </Text>
          <Text style={styles.statsText}>{item.count || 0} Oyuncu Raporladı</Text>
        </View>

        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{item.score || 0}</Text>
          <Text style={styles.ptsText}>PTS</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e1e1e" />
      
      <View style={styles.header}>
        <MaterialCommunityIcons name="trophy-award" size={55} color="#f1c40f" style={{ marginBottom: 5 }} />
        <Text style={styles.headerTitle}>Liderlik Tablosu</Text>
        <Text style={styles.headerSubtitle}>En iyiler zirvede yer alır.</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#f1c40f" /></View>
      ) : (
        <FlatList
          data={scouts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderScout}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f1c40f" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="podium" size={80} color="#34495e" />
              <Text style={styles.emptyTitle}>Sıralama Boş</Text>
              <Text style={styles.emptyText}>Henüz kimse puan kazanmamış. İlk oyuncuyu sen ekle, zirveye yerleş!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    padding: 30, 
    paddingTop: Platform.OS === 'ios' ? 20 : 50, 
    backgroundColor: '#1e1e1e', 
    borderBottomLeftRadius: 40, 
    borderBottomRightRadius: 40, 
    alignItems: 'center', 
    elevation: 10,
    zIndex: 10
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
  headerSubtitle: { fontSize: 14, color: '#f1c40f', marginTop: 5, fontWeight: '600' },
  listContainer: { padding: 20, paddingBottom: 100 },
  card: { flexDirection: 'row', borderRadius: 20, padding: 18, marginBottom: 15, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  topThreeCard: { 
    transform: [{ scale: 1.02 }],
    elevation: 5,
  },
  rankContainer: { width: 45, alignItems: 'center', justifyContent: 'center' },
  rankText: { color: '#7f8c8d', fontSize: 22, fontWeight: 'bold' },
  infoContainer: { flex: 1, marginLeft: 15 },
  nameText: { color: '#fff', fontSize: 17, fontWeight: 'bold', letterSpacing: 0.5 },
  statsText: { color: '#95a5a6', fontSize: 12, marginTop: 4, fontWeight: '500' },
  scoreBadge: { alignItems: 'flex-end', backgroundColor: 'rgba(46, 204, 113, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  scoreText: { color: '#2ecc71', fontSize: 22, fontWeight: '900' },
  ptsText: { color: '#2ecc71', fontSize: 10, fontWeight: 'bold', marginTop: -2 },
  // 🔥 EKSİK OLAN STİLLER EKLENDİ - ARTIK HATA VERMEYECEK
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 20 },
  emptyText: { color: '#7f8c8d', fontSize: 15, textAlign: 'center', marginTop: 10, lineHeight: 22 }
});