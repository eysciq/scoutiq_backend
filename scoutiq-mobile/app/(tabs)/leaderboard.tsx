import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, SafeAreaView, FlatList, ActivityIndicator, RefreshControl, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

export default function LeaderboardScreen() {
  const [scouts, setScouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 📡 LİDERLİK VERİLERİNİ ÇEK
  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('http://192.168.1.181:3001/leaderboard');
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

  // 🥇 İLK 3 KİŞİYE ÖZEL RENKLER
  const getMedalColor = (index: number) => {
    if (index === 0) return '#f1c40f'; // Altın
    if (index === 1) return '#bdc3c7'; // Gümüş
    if (index === 2) return '#cd7f32'; // Bronz
    return '#34495e'; 
  };

  const renderScout = ({ item, index }: any) => {
    const isTopThree = index < 3;
    const medalColor = getMedalColor(index);

    return (
      <View style={[
        styles.card, 
        isTopThree && { ...styles.topThreeCard, borderColor: medalColor }
      ]}>
        {/* SIRA NUMARASI VEYA MADALYA */}
        <View style={styles.rankContainer}>
          {isTopThree ? (
            <MaterialCommunityIcons name="medal" size={32} color={medalColor} />
          ) : (
            <Text style={styles.rankText}>{index + 1}</Text>
          )}
        </View>

        {/* SCOUT BİLGİLERİ */}
        <View style={styles.infoContainer}>
          <Text style={[styles.nameText, isTopThree && { color: medalColor }]}>
            {item.name.toUpperCase()}
          </Text>
          <Text style={styles.statsText}>{item.count} Oyuncu Raporladı</Text>
        </View>

        {/* PUAN */}
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{item.score}</Text>
          <Text style={styles.ptsText}>PTS</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* 🏆 ÜST BAŞLIK */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="trophy-award" size={50} color="#f1c40f" />
        <Text style={styles.headerTitle}>Liderlik Tablosu</Text>
        <Text style={styles.headerSubtitle}>En iyiler zirvede yer alır.</Text>
      </View>

      {/* 📋 LİSTE */}
      {loading && !refreshing ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#f1c40f" /></View>
      ) : (
        <FlatList
          data={scouts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderScout}
          contentContainerStyle={styles.listContainer}
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
  header: { padding: 30, paddingTop: 50, backgroundColor: '#1e1e1e', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, alignItems: 'center', elevation: 8 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 10 },
  headerSubtitle: { fontSize: 14, color: '#95a5a6', marginTop: 5 },
  listContainer: { padding: 20, paddingBottom: 40 },
  card: { flexDirection: 'row', backgroundColor: '#1e1e1e', borderRadius: 20, padding: 15, marginBottom: 15, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  topThreeCard: { 
    backgroundColor: '#1c2833', 
    transform: [{ scale: 1.03 }], // Senin o efsane büyütme efektin
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  rankContainer: { width: 40, alignItems: 'center', justifyContent: 'center' },
  rankText: { color: '#7f8c8d', fontSize: 20, fontWeight: 'bold' },
  infoContainer: { flex: 1, marginLeft: 15 },
  nameText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  statsText: { color: '#95a5a6', fontSize: 12, marginTop: 4 },
  scoreBadge: { alignItems: 'flex-end' },
  scoreText: { color: '#2ecc71', fontSize: 24, fontWeight: 'bold' },
  ptsText: { color: '#7f8c8d', fontSize: 10, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 20 },
  emptyText: { color: '#7f8c8d', fontSize: 15, textAlign: 'center', marginTop: 10, lineHeight: 22 }
});