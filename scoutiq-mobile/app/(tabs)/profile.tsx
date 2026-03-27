import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ActivityIndicator, TouchableOpacity, Alert, ScrollView, RefreshControl, StatusBar, Modal, FlatList } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LegendItem = ({ color, label }: any) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={styles.legendText}>{label}</Text>
  </View>
);

export default function ProfileScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [stats, setStats] = useState({ score: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [myReports, setMyReports] = useState<any[]>([]);

  const [dnaStats, setDnaStats] = useState({
    avgAge: 0, forvet: 0, orta: 0, defans: 0, kaleci: 0, total: 0
  });

  const BACKEND_URL = 'http://192.168.1.181:3001';

  const getScoutRank = (score: number): { label: string, color: string, icon: any } => {
    if (score >= 500) return { label: "EFSANE SCOUT", color: "#f1c40f", icon: "crown" as any };
    if (score >= 200) return { label: "USTA GÖZLEMCİ", color: "#e67e22", icon: "shield-star" as any };
    if (score >= 50) return { label: "PROFESYONEL", color: "#3498db", icon: "medal" as any };
    return { label: "ÇAYLAK SCOUT", color: "#95a5a6", icon: "account-edit" as any };
  };

  const loadProfileData = async () => {
    try {
      const rawEmail = await AsyncStorage.getItem('userEmail');
      const email = rawEmail ? rawEmail.trim().toLowerCase() : '';
      setUserEmail(email);

      // 🔥 YENİ: KAYITLI İSMİ ÇEKİYORUZ
      const savedName = await AsyncStorage.getItem('userName');
      setUserName(savedName || (email ? email.split('@')[0] : 'Misafir'));

      if (!email) { setLoading(false); return; }

      const safeEmail = encodeURIComponent(email);
      
      const profileRes = await fetch(`${BACKEND_URL}/my-profile?email=${safeEmail}`);
      if (profileRes.ok) {
        const veri = await profileRes.json();
        setStats({ score: veri.score || 0, count: veri.count || 0 });
      }

      const playersRes = await fetch(`${BACKEND_URL}/players?scoutEmail=${safeEmail}`);
      if (playersRes.ok) {
        const players = await playersRes.json();
        setMyReports(players);
        calculateDNA(players);
      }

    } catch (error) {
      console.log("❌ Profil Veri Hatası:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateDNA = (players: any[]) => {
    if (!players || players.length === 0) return;
    let totalAge = 0; let fv = 0; let os = 0; let df = 0; let kl = 0;
    
    players.forEach(p => {
      if (p.age) totalAge += Number(p.age);
      const pos = (p.position || "").toUpperCase();
      if (pos.includes('SNT') || pos.includes('FOR') || pos.includes('KANAT')) fv++;
      else if (pos.includes('OS') || pos.includes('MER') || pos.includes('ON') || pos.includes('DOS')) os++;
      else if (pos.includes('DEF') || pos.includes('STP') || pos.includes('BEK') || pos.includes('CB')) df++;
      else if (pos.includes('KL') || pos.includes('GK')) kl++;
      else os++; 
    });

    setDnaStats({
      avgAge: Math.round(totalAge / players.length) || 0,
      forvet: fv, orta: os, defans: df, kaleci: kl, total: players.length
    });
  };

  useFocusEffect(useCallback(() => { loadProfileData(); }, []));

  // 🔥 YENİ: HATA VERMEYEN, TEMİZ ÇIKIŞ YAP FONKSİYONU
  const cikisYap = () => {
    Alert.alert("Güvenli Çıkış", "Oturumunuz kapatılsın mı?", [
      { text: "İptal", style: "cancel" },
      { text: "Evet", style: "destructive", onPress: async () => {
          await AsyncStorage.removeItem('userEmail');
          await AsyncStorage.removeItem('userName');
          router.replace('/auth'); // 🚀 SİHİRLİ DOKUNUŞ BURADA
      }}
    ]);
  };

  if (loading && !refreshing) return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#2ecc71" /></View>;

  const rank = getScoutRank(stats.score);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); loadProfileData();}} tintColor="#2ecc71" />}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scout Kariyeri</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.profileCard}>
            <View style={[styles.avatarCircle, { borderColor: rank.color }]}>
              <MaterialCommunityIcons name={rank.icon} size={60} color={rank.color} />
            </View>
            
            {/* 🔥 YENİ: PROFİL İSMİ ARTIK DAHA ŞIK */}
            <Text style={styles.nameText}>{userName.toUpperCase()}</Text>
            
            <Text style={[styles.rankText, { color: rank.color }]}>{rank.label}</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.score}</Text>
                <Text style={styles.statLabel}>Toplam Puan</Text>
              </View>
              <View style={styles.separator} />
              <TouchableOpacity style={styles.statBox} onPress={() => setModalVisible(true)}>
                <Text style={styles.statNumber}>{stats.count}</Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={[styles.statLabel, { color: '#2ecc71', fontWeight: 'bold' }]}>Raporlarım</Text>
                  <MaterialCommunityIcons name="gesture-tap" size={14} color="#2ecc71" style={{marginLeft: 4}} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {dnaStats.total > 0 && (
            <View style={styles.dnaCard}>
              <Text style={styles.dnaTitle}>Scout DNA'sı (Analiz)</Text>
              <View style={styles.dnaRow}>
                <Text style={styles.dnaLabel}>Yaş Ortalaması</Text>
                <Text style={styles.dnaValue}>{dnaStats.avgAge} Yaş</Text>
              </View>

              <Text style={styles.dnaLabel}>Tercih Edilen Mevkiler</Text>
              <View style={styles.barContainer}>
                <View style={[styles.barSegment, { flex: dnaStats.forvet + 0.1, backgroundColor: '#e74c3c' }]} />
                <View style={[styles.barSegment, { flex: dnaStats.orta + 0.1, backgroundColor: '#f1c40f' }]} />
                <View style={[styles.barSegment, { flex: dnaStats.defans + 0.1, backgroundColor: '#3498db' }]} />
                <View style={[styles.barSegment, { flex: dnaStats.kaleci + 0.1, backgroundColor: '#9b59b6' }]} />
              </View>
              
              <View style={styles.legendContainer}>
                <LegendItem color="#e74c3c" label="Hücum" />
                <LegendItem color="#f1c40f" label="Merkez" />
                <LegendItem color="#3498db" label="Savunma" />
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={cikisYap}>
            <MaterialCommunityIcons name="logout" size={24} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.logoutText}>Oturumu Kapat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Geçmiş Raporlarım</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={myReports}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ padding: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalPlayerCard}
                  onPress={() => {
                    setModalVisible(false);
                    router.push({ pathname: "/player-details", params: { id: item.id } });
                  }}
                >
                  <MaterialCommunityIcons name="clipboard-check-outline" size={24} color="#2ecc71" />
                  <View style={{ marginLeft: 15, flex: 1 }}>
                    <Text style={styles.modalPlayerName}>{item.name}</Text>
                    <Text style={styles.modalPlayerPos}>{item.position} • {item.rating} Reyting</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#7f8c8d" />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  centerContainer: { flex: 1, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' },
  header: { padding: 25, paddingTop: 50, backgroundColor: '#2c3e50', borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  content: { padding: 20 },
  profileCard: { backgroundColor: '#2c3e50', borderRadius: 30, padding: 30, alignItems: 'center', marginTop: -15, elevation: 12 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center', borderWidth: 4, marginBottom: 15 },
  nameText: { fontSize: 24, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
  rankText: { fontSize: 14, fontWeight: 'bold', marginBottom: 25, letterSpacing: 1 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', borderTopWidth: 1, borderTopColor: '#34495e', paddingTop: 20 },
  separator: { width: 1, height: '70%', backgroundColor: '#34495e', alignSelf: 'center' },
  statBox: { alignItems: 'center', flex: 1 },
  statNumber: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  statLabel: { color: '#bdc3c7', fontSize: 12 },
  dnaCard: { backgroundColor: '#1e1e1e', borderRadius: 25, padding: 25, marginTop: 25, borderWidth: 1, borderColor: '#333' },
  dnaTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  dnaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  dnaLabel: { color: '#95a5a6', fontSize: 14, fontWeight: 'bold' },
  dnaValue: { color: '#2ecc71', fontSize: 18, fontWeight: 'bold' },
  barContainer: { height: 12, flexDirection: 'row', borderRadius: 6, overflow: 'hidden', marginTop: 10, backgroundColor: '#333' },
  barSegment: { height: '100%' },
  legendContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { color: '#bdc3c7', fontSize: 11 },
  logoutButton: { flexDirection: 'row', backgroundColor: '#e74c3c', padding: 20, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 35 },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1e1e1e', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '75%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderBottomWidth: 1, borderBottomColor: '#333' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  closeBtn: { backgroundColor: '#333', padding: 8, borderRadius: 20 },
  modalPlayerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2c3e50', padding: 15, borderRadius: 15, marginBottom: 15, marginHorizontal: 20 },
  modalPlayerName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalPlayerPos: { color: '#95a5a6', fontSize: 13, marginTop: 4 },
});